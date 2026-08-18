#!/usr/bin/env python3
"""Rule engine for the adaptive questionnaire — reference implementation.

This is a faithful, dependency-free implementation of docs 02-06 in the parent
folder, written so the rules can be executed and measured before any of them
reach the production app. It is NOT the production engine: production will be
TypeScript in `lib/assessment/`. This exists to answer questions that cannot be
answered by reading the documents, such as "does any respondent finish in fewer
than 18 items?".

Everything is pure: `next_item(state)` and `apply(state, response)` never touch
I/O, never look at the clock, and never call a language model.
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass, field
from pathlib import Path

BANK_PATH = Path(__file__).resolve().parent.parent / "bank" / "items.json"

# ---------------------------------------------------------------------------
# developer-set constants — every one of these is a guess, see 05 §5.3
# ---------------------------------------------------------------------------

MAX_ITEMS = 34
MIN_ITEMS = 18
MAX_PER_DIMENSION = 6
MAX_PER_FACET = 3
BUDGET_PER_KEY = 2
CONFIDENCE_SATISFIED = 0.75
CONFIDENCE_LOW = 0.40
TARGET_WEIGHT = 3.0
SD_MAX = 2.0
DIMINISHING_EPSILON = 0.03
DIMINISHING_LOOKBACK = 3
LOW_EXCEPTION_FLOOR = 1   # floor on scored items before the low-confidence exception lapses (see FIX 13)
TIE_BAND_FACTOR = 1.2
MAX_CLARIFY_TOTAL = 5
MAX_CLARIFY_PER_DIMENSION = 2
MAX_CLARIFY_PER_CONTRADICTION = 2
EXPLORE_POSITIONS = (8, 15, 22)

DIMENSIONS = "RIASEC"
HEX_ORDER = ["R", "I", "A", "S", "E", "C"]
OPPOSITE = {"R": "S", "S": "R", "I": "E", "E": "I", "A": "C", "C": "A"}
ADJACENT = {d: {HEX_ORDER[(i - 1) % 6], HEX_ORDER[(i + 1) % 6]}
            for i, d in enumerate(HEX_ORDER)}

SEED_ORDER = ["VAL-01", "INT-R-01", "INT-I-01", "INT-A-01",
              "INT-S-01", "INT-E-01", "INT-C-01"]

TERMINAL = {"satisfied", "pruned", "genuinely-uncertain", "unresolved-mixed"}


# ---------------------------------------------------------------------------
# bank
# ---------------------------------------------------------------------------

class Bank:
    def __init__(self, path: Path = BANK_PATH):
        raw = json.loads(path.read_text(encoding="utf-8"))
        self.items = {i["id"]: i for i in raw["items"]}
        self.facets = raw["facets"]
        self.order = [i["id"] for i in raw["items"]]

    def budget_key(self, item) -> str:
        # 02 §2.2 defines the key as dimension:facet:probeType. Dimensionless
        # items (scenario, forced-choice, integration, clarify, values, open
        # text) would all collide in a single bucket and starve each other, so
        # they get a per-item key instead. Per-item is strictly tighter than the
        # documented key, so the termination argument in 05 §5.1 still holds.
        if item["dimension"] is None:
            return f"-:-:{item['probeType']}:{item['id']}"
        return f"{item['dimension']}:{item['facet']}:{item['probeType']}"


# ---------------------------------------------------------------------------
# state
# ---------------------------------------------------------------------------

@dataclass
class Answer:
    item_id: str
    raw: int | None = None          # 1..5 for scale items
    choice: str | None = None       # option value for choice/pair items
    text: str | None = None


@dataclass
class State:
    tier: str = "UPPER_SECONDARY"
    answers: list[Answer] = field(default_factory=list)
    asked: list[str] = field(default_factory=list)
    branch: dict[str, str] = field(default_factory=lambda: {d: "open" for d in DIMENSIONS})
    prune_candidate: dict[str, int] = field(default_factory=lambda: {d: 0 for d in DIMENSIONS})
    budget: dict[str, int] = field(default_factory=dict)
    reopened: set[str] = field(default_factory=set)
    resolved_contradictions: set[str] = field(default_factory=set)
    clarify_asked: int = 0
    clarify_by_dim: dict[str, int] = field(default_factory=lambda: {d: 0 for d in DIMENSIONS})
    clarify_by_contradiction: dict[str, int] = field(default_factory=dict)
    pending_clarify: list[tuple[str, str, str | None]] = field(default_factory=list)
    env_pending: list[str] = field(default_factory=list)
    threes: dict[str, list[str]] = field(default_factory=lambda: {d: [] for d in DIMENSIONS})
    experience_asked: set[str] = field(default_factory=set)
    experience_gap: dict[str, bool] = field(default_factory=dict)
    evidence_quality: dict[str, str] = field(default_factory=dict)
    profile_consistency: str | None = None
    uncertain_hits: dict[str, int] = field(default_factory=lambda: {d: 0 for d in DIMENSIONS})
    confidence_history: list[float] = field(default_factory=list)
    explore_used: int = 0
    stop_reason: str | None = None
    quit_early: bool = False

    # --- derived, recomputed after each answer -----------------------------
    # (weight, adjusted 1..5, counts toward consistency)
    contributions: dict[str, list[tuple[float, float, bool]]] = field(
        default_factory=lambda: {d: [] for d in DIMENSIONS})
    facets_seen: dict[str, set[str]] = field(
        default_factory=lambda: {d: set() for d in DIMENSIONS})
    per_dimension_count: dict[str, int] = field(
        default_factory=lambda: {d: 0 for d in DIMENSIONS})
    per_dimension_scored: dict[str, int] = field(
        default_factory=lambda: {d: 0 for d in DIMENSIONS})
    per_facet_count: dict[str, int] = field(default_factory=dict)


# ---------------------------------------------------------------------------
# scoring · confidence
# ---------------------------------------------------------------------------

def score(state: State, d: str) -> float | None:
    """Weighted mean of direction-adjusted answers, on the original 1-5 scale."""
    rows = state.contributions[d]
    if not rows:
        return None
    total_w = sum(w for w, _, _ in rows)
    return sum(w * v for w, v, _ in rows) / total_w if total_w else None


def coverage(state: State, d: str) -> float:
    total = sum(w for w, _, _ in state.contributions[d])
    return min(1.0, total / TARGET_WEIGHT)


def consistency(state: State, d: str) -> float:
    # FIX 10: intensity probes ask how *persistent* an interest is, deliberately
    # pitched lower than the interest item itself. Feeding them into the spread
    # made the L5 probe punish the very dimension it was refining — median
    # confidence in the top dimension fell as soon as they became reachable.
    values = [v for _, v, counts in state.contributions[d] if counts]
    if len(values) < 2:
        return 1.0
    mean = sum(values) / len(values)
    sd = math.sqrt(sum((v - mean) ** 2 for v in values) / len(values))
    return max(0.0, 1.0 - sd / SD_MAX)


def confidence(state: State, d: str) -> float:
    return coverage(state, d) * consistency(state, d)


def tie_band(state: State) -> float:
    values = [v for d in DIMENSIONS for _, v, _ in state.contributions[d]]
    if len(values) < 2:
        return 0.0
    mean = sum(values) / len(values)
    sd = math.sqrt(sum((v - mean) ** 2 for v in values) / len(values))
    return TIE_BAND_FACTOR * sd / math.sqrt(len(values))


def TOP_MIN_COVERAGE() -> float:
    return 0.5


def top_dimension(state: State) -> str | None:
    """The highest-scoring dimension that has enough behind it to be called
    highest. FIX 12: without the coverage floor a single scenario pick could
    outrank a dimension backed by four scale items."""
    scored = [(score(state, d), d) for d in DIMENSIONS
              if score(state, d) is not None and coverage(state, d) >= TOP_MIN_COVERAGE()]
    if not scored:
        scored = [(score(state, d), d) for d in DIMENSIONS if score(state, d) is not None]
    return max(scored)[1] if scored else None


# ---------------------------------------------------------------------------
# applying an answer
# ---------------------------------------------------------------------------

def _record_contribution(state: State, d: str, weight: float, adjusted: float,
                         facet: str | None, counts_for_consistency: bool = True) -> None:
    # 02 §2.3: an item from a facet already asked in this dimension only counts
    # half, because asking the same thing three times adds no coverage.
    if facet and facet in state.facets_seen[d]:
        weight *= 0.5
    if facet:
        state.facets_seen[d].add(facet)
    state.contributions[d].append((weight, adjusted, counts_for_consistency))


def apply(bank: Bank, state: State, answer: Answer) -> State:
    item = bank.items[answer.item_id]
    state.answers.append(answer)
    state.asked.append(answer.item_id)

    key = bank.budget_key(item)
    state.budget[key] = state.budget.get(key, BUDGET_PER_KEY) - 1

    d = item["dimension"]
    if d:
        state.per_dimension_count[d] += 1
        # FIX 3 (see sim/README.md): only scored items consume a dimension's
        # measurement budget. Counting context probes here starved the very
        # dimensions the system was most confident about.
        if item["scoring"] == "dimension":
            state.per_dimension_scored[d] += 1
    if item["facet"]:
        state.per_facet_count[item["facet"]] = state.per_facet_count.get(item["facet"], 0) + 1

    if item["purpose"] == "clarify":
        state.clarify_asked += 1

    # ---- scoring -------------------------------------------------------
    if item["scoring"] == "dimension":
        w = item["diagnosticWeight"]
        if item["responseFormat"] == "scale5":
            raw = answer.raw
            if raw == 3:
                pass  # 03 §3.2: "not sure" carries no evidence, weight 0
            else:
                adjusted = (6 - raw) if item["direction"] == "reverse" else raw
                _record_contribution(state, d, w, adjusted, item["facet"],
                                     counts_for_consistency=item["probeType"] != "intensity")
        else:
            chosen = next(o for o in item["options"] if o["value"] == answer.choice)
            for dim, share in chosen.get("maps", {}).items():
                _record_contribution(state, dim, w * share, 4.5, None)

    # ---- branch transitions (03 §3.2) ----------------------------------
    if d and item["responseFormat"] == "scale5" and item["scoring"] == "dimension":
        raw = answer.raw
        if raw == 5:
            if state.branch[d] not in TERMINAL:
                state.branch[d] = "deep"
        elif raw == 4:
            fours = sum(1 for a in state.answers
                        if bank.items[a.item_id]["dimension"] == d and a.raw == 4)
            if state.branch[d] == "open" and fours >= 2:
                state.branch[d] = "deep"
        elif raw == 3:
            state.uncertain_hits[d] += 1
            state.threes[d].append(item["probeType"])
            # FIX 4: 03 §3.2 requires two "not sure" answers *in two different
            # formats*, and the experience probe has to have had its chance
            # first — otherwise the branch closes before the system learns that
            # the uncertainty is a missing opportunity, not a dislike.
            formats = set(state.threes[d])
            if (len(formats) >= 2 and d in state.experience_asked
                    and state.branch[d] not in TERMINAL):
                state.branch[d] = "genuinely-uncertain"
        elif raw == 2:
            if state.branch[d] == "open":
                state.branch[d] = "deprioritised"
        elif raw == 1:
            state.prune_candidate[d] += 1
            if state.branch[d] == "open":
                state.branch[d] = "deprioritised"

        # FIX 2: a positive answer inside a pruned dimension is the strongest
        # possible reopen evidence; 03 §3.4 listed five triggers and missed it.
        if raw in (4, 5) and state.branch[d] == "pruned" and d not in state.reopened:
            state.branch[d] = "open"
            state.reopened.add(d)
            state.prune_candidate[d] = 0

    if item["probeType"] == "experience":
        state.experience_asked.add(d)
        if answer.choice == "never-curious":
            state.experience_gap[d] = True
            if state.branch[d] in ("deprioritised",):
                state.branch[d] = "open"
        elif answer.choice == "never-uninterested":
            state.prune_candidate[d] += 1
        elif answer.choice == "often":
            state.evidence_quality[d] = "high"

    # FIX 5b: "it depends who I do it with" routes to the environment probe
    if item["purpose"] == "clarify" and answer.choice:
        chosen = next((o for o in item.get("options", [])
                       if o["value"] == answer.choice), None)
        if chosen and chosen.get("hypothesis") == "environment":
            state.env_pending.append(f"env:{len(state.asked)}")

    if item["probeType"] == "integration" and answer.raw is not None:
        pair = "".join(item["integratesPair"])
        state.resolved_contradictions.add(f"opposite:{pair}")
        if answer.raw >= 4:
            state.profile_consistency = "low"
            for dim in item["integratesPair"]:
                if state.branch[dim] == "pruned":
                    state.branch[dim] = "open"

    _update_prune(bank, state)
    _update_satisfied(state)
    state.confidence_history.append(
        sum(confidence(state, d) for d in DIMENSIONS) / len(DIMENSIONS))
    return state


def _integration_protected(state: State, d: str) -> bool:
    """03 §3.3 rule 6: do not prune the opposite of a dimension scoring 5."""
    if state.profile_consistency == "low":
        return True
    opp = OPPOSITE[d]
    opp_score = score(state, opp)
    return opp_score is not None and opp_score >= 4.5


def _update_prune(bank: Bank, state: State) -> None:
    for d in DIMENSIONS:
        if state.branch[d] in TERMINAL or state.prune_candidate[d] == 0:
            continue
        negatives = [(a, bank.items[a.item_id]) for a in state.answers
                     if bank.items[a.item_id]["dimension"] == d
                     and bank.items[a.item_id]["scoring"] == "dimension"
                     and a.raw in (1, 2)]
        positives = [a for a in state.answers
                     if bank.items[a.item_id]["dimension"] == d and a.raw in (4, 5)]
        if len(negatives) < 2:                                  # rule 1
            continue
        if not any(i["diagnosticStrength"] == "high" for _, i in negatives):  # rule 2
            continue
        if len({i["facet"] for _, i in negatives if i["facet"]}) < 2:         # rule 3
            continue
        if positives:                                                        # rule 4
            continue
        if state.clarify_by_dim[d] and state.branch[d] == "unresolved-mixed":  # rule 5
            continue
        if _integration_protected(state, d):                                 # rule 6
            continue
        state.branch[d] = "pruned"


def _update_satisfied(state: State) -> None:
    for d in DIMENSIONS:
        if state.branch[d] in TERMINAL:
            continue
        if confidence(state, d) >= CONFIDENCE_SATISFIED:
            state.branch[d] = "satisfied"
        elif state.per_dimension_count[d] >= MAX_PER_DIMENSION:
            state.branch[d] = "satisfied" if confidence(state, d) >= CONFIDENCE_LOW \
                else "unresolved-mixed"


# ---------------------------------------------------------------------------
# contradictions (04 §4.2)
# ---------------------------------------------------------------------------

def detect_contradictions(bank: Bank, state: State) -> list[tuple[str, str, str | None]]:
    """Return (contradiction_id, kind, dimension) for unresolved contradictions."""
    found = []
    by_dim: dict[str, list[Answer]] = {d: [] for d in DIMENSIONS}
    for a in state.answers:
        it = bank.items[a.item_id]
        if it["dimension"] and it["scoring"] == "dimension" and a.raw is not None:
            by_dim[it["dimension"]].append(a)

    for d, answers in by_dim.items():
        highs = [a for a in answers if a.raw >= 4]
        lows = [a for a in answers if a.raw <= 2]
        for hi in highs:
            for lo in lows:
                hi_item, lo_item = bank.items[hi.item_id], bank.items[lo.item_id]
                if hi_item.get("reverseCounterpart") == lo.item_id:
                    continue  # a positive/reverse pair going opposite ways is agreement
                cid = f"within:{d}:{min(hi.item_id, lo.item_id)}:{max(hi.item_id, lo.item_id)}"
                found.append((cid, "within-dimension", d))

    # reverse-fail: an item and its reverse counterpart pointing the same way
    for a in state.answers:
        it = bank.items[a.item_id]
        counterpart = it.get("reverseCounterpart")
        if not counterpart or a.raw is None:
            continue
        other = next((x for x in state.answers if x.item_id == counterpart), None)
        if other is None or other.raw is None:
            continue
        if it["direction"] == "reverse":
            continue  # evaluate each pair once, from the positive side
        if (a.raw >= 4 and other.raw >= 4) or (a.raw <= 2 and other.raw <= 2):
            cid = f"reverse-fail:{a.item_id}"
            found.append((cid, "reverse-fail", it["dimension"]))

    # FIX 5a · format-flip: liked the activity on the scale, then declined the
    # same dimension when a scenario made it cost real time. 04 §4.2 defined
    # this kind but nothing produced it, so CHK-REAL-01 could never fire.
    for a in state.answers:
        it = bank.items[a.item_id]
        if it["probeType"] != "scenario" or not a.choice or it["purpose"] == "clarify":
            continue
        chosen = next((o for o in it["options"] if o["value"] == a.choice), None)
        taken = set((chosen or {}).get("maps", {}))
        offered = {dim for o in it["options"] for dim in o.get("maps", {})}
        for d in offered - taken:
            liked = [x for x in state.answers
                     if bank.items[x.item_id]["dimension"] == d
                     and bank.items[x.item_id]["scoring"] == "dimension"
                     and x.raw is not None and x.raw >= 4]
            if liked:
                found.append((f"flip:{a.item_id}:{d}", "format-flip", d))

    # environment follow-ups queued by a clarify answer
    for cid in state.env_pending:
        found.append((cid, "environment", None))

    # opposite pair high
    for d, opp in (("R", "S"), ("I", "E"), ("A", "C")):
        sd_, so = score(state, d), score(state, opp)
        if sd_ is not None and so is not None and sd_ >= 4.0 and so >= 4.0 \
                and len(state.contributions[d]) >= 2 and len(state.contributions[opp]) >= 2:
            found.append((f"opposite:{d}{opp}", "opposite-pair-high", None))

    return [f for f in found if f[0] not in state.resolved_contradictions]


def apply_reverse_fail_penalty(bank: Bank, state: State, d: str) -> None:
    """04 §4.2: halve the weight of every answer in a dimension that failed the
    reverse check, because the responses there are not trustworthy."""
    state.contributions[d] = [(w * 0.5, v, c) for w, v, c in state.contributions[d]]


# ---------------------------------------------------------------------------
# eligibility · priority · selection
# ---------------------------------------------------------------------------

def _triggers_met(bank: Bank, state: State, item, contradictions) -> bool:
    triggers = item.get("triggers")
    if not triggers:
        return True
    band = tie_band(state)
    for t in triggers:
        on = t["on"]
        if on == "response":
            a = next((x for x in state.answers if x.item_id == t["item"]), None)
            if a and a.raw in t["values"]:
                return True
        elif on == "dimensionHigh":
            s = score(state, t["dimension"])
            if s is not None and s >= t["minScore"]:
                return True
        elif on == "uncertain":
            d = t.get("dimension") or (bank.items[t["item"]]["dimension"] if t.get("item") else None)
            if d and state.uncertain_hits[d] >= 1:
                return True
        elif on == "tie":
            d1, d2 = t["dimensions"]
            s1, s2 = score(state, d1), score(state, d2)
            if s1 is not None and s2 is not None and abs(s1 - s2) <= max(band, 0.15):
                return True
        elif on == "oppositePairHigh":
            pair = set(t["pair"])
            if any(set([c[0].split(":")[1][0], c[0].split(":")[1][1]]) == pair
                   for c in contradictions if c[1] == "opposite-pair-high"):
                return True
        elif on == "contradiction":
            if any(c[1] == t["kind"] for c in contradictions):
                return True
    return False


def eligible(bank: Bank, state: State, contradictions) -> list[str]:
    out = []
    for item_id in bank.order:
        if item_id in state.asked:
            continue
        item = bank.items[item_id]
        if state.tier not in item["tierScope"]:
            continue
        key = bank.budget_key(item)
        if state.budget.get(key, BUDGET_PER_KEY) <= 0:
            continue
        d = item["dimension"]
        scored = item["scoring"] == "dimension"
        if d and scored:
            # FIX 3: caps and terminal states gate *measurement* only. Context
            # probes (self-efficacy, experience) are about a dimension but add
            # no evidence to it, so a closed branch must not silence them.
            if state.per_dimension_scored[d] >= MAX_PER_DIMENSION:
                continue
            if state.branch[d] in ("satisfied", "genuinely-uncertain", "unresolved-mixed"):
                if not (item["level"] == "L5" and state.branch[d] == "satisfied"):
                    continue
            if state.branch[d] == "pruned" and d in state.reopened:
                continue
        elif d and state.per_dimension_count[d] >= MAX_PER_DIMENSION + 3:
            continue
        facet = item["facet"]
        if facet and state.per_facet_count.get(facet, 0) >= MAX_PER_FACET:
            continue
        if item["purpose"] == "clarify":
            if state.clarify_asked >= MAX_CLARIFY_TOTAL:
                continue
            if not state.pending_clarify:
                continue
        if not _triggers_met(bank, state, item, contradictions):
            continue
        out.append(item_id)
    return out


def priority(bank: Bank, state: State, item_id: str, contradictions,
             explore_turn: bool) -> float:
    item = bank.items[item_id]
    d = item["dimension"]
    p = 0.0

    if item["purpose"] == "clarify" and state.pending_clarify:
        p += 3.0
    if item["probeType"] == "integration" and any(
            c[1] == "opposite-pair-high" for c in contradictions):
        p += 3.0

    if d:
        p += 2.0 * (1.0 - confidence(state, d))
    else:
        worst = min((confidence(state, x) for x in DIMENSIONS), default=0.0)
        p += 2.0 * (1.0 - worst) * 0.5

    if item["facet"] and d and item["facet"] not in state.facets_seen[d]:
        p += 1.5

    if item["scoring"] == "tiebreak":
        p += 1.0

    if item["probeType"] == "experience" and d and d not in state.experience_asked \
            and state.uncertain_hits[d] >= 1:
        p += 1.8
    if item["probeType"] == "self-efficacy" and d and state.branch[d] in ("satisfied", "deep"):
        p += 1.2

    if explore_turn:
        p += 0.8 * _explore_bonus(state, item)

    if d and state.branch[d] == "pruned":
        p -= 2.0
    if d and state.branch[d] == "deprioritised":
        p -= 0.5

    recent = [bank.items[i]["probeType"] for i in state.asked[-2:]]
    if len(recent) == 2 and recent[0] == recent[1] == item["probeType"]:
        p -= 1.0

    # 06 §6.3: at least one reverse item in the dimension currently on top.
    if item.get("direction") == "reverse" and d == top_dimension(state):
        p += 1.2
        if len(state.asked) >= MIN_ITEMS - 4:
            p += 2.5      # the session is near its end and the mandate is unmet

    p -= 0.001 * bank.order.index(item_id)   # deterministic tie-break
    return p


def _explore_bonus(state: State, item) -> float:
    d = item["dimension"]
    top = top_dimension(state)
    if d and top and d == OPPOSITE[top]:
        return 1.0
    if d:
        lowest = min(DIMENSIONS, key=lambda x: coverage(state, x))
        if d == lowest:
            return 0.8
    if item["facet"] and not any(item["facet"] in s for s in state.facets_seen.values()):
        return 0.6
    return 0.0


def next_item(bank: Bank, state: State) -> str | None:
    n = len(state.asked)
    if n < len(SEED_ORDER):
        return SEED_ORDER[n]

    contradictions = detect_contradictions(bank, state)
    for cid, kind, d in contradictions:
        if kind == "reverse-fail" and d:
            apply_reverse_fail_penalty(bank, state, d)
            state.resolved_contradictions.add(cid)
        elif kind == "within-dimension" and d:
            if (state.clarify_by_dim[d] < MAX_CLARIFY_PER_DIMENSION
                    and state.clarify_by_contradiction.get(cid, 0) < MAX_CLARIFY_PER_CONTRADICTION
                    and state.clarify_asked < MAX_CLARIFY_TOTAL):
                if (cid, kind, d) not in state.pending_clarify:
                    state.pending_clarify.append((cid, kind, d))
            else:
                state.resolved_contradictions.add(cid)
                if state.branch[d] not in TERMINAL:
                    state.branch[d] = "unresolved-mixed"

    explore_turn = (n + 1) in EXPLORE_POSITIONS and state.explore_used < 3

    candidates = eligible(bank, state, contradictions)
    if not candidates:
        return None
    best = max(candidates,
               key=lambda i: priority(bank, state, i, contradictions, explore_turn))
    if explore_turn:
        state.explore_used += 1
    if bank.items[best]["purpose"] == "clarify" and state.pending_clarify:
        cid, kind, d = state.pending_clarify.pop(0)
        state.clarify_by_contradiction[cid] = state.clarify_by_contradiction.get(cid, 0) + 1
        if d:
            state.clarify_by_dim[d] += 1
        state.resolved_contradictions.add(cid)
    return best


# ---------------------------------------------------------------------------
# stopping (05 §5.2)
# ---------------------------------------------------------------------------

def _needs_reverse_in_top(bank: Bank, state: State) -> str | None:
    """06 §6.3: a session may not end without a reverse-keyed item in the
    dimension that is currently highest.

    FIX 1: the mandate is checked against the items the selector will actually
    hand out, not against the bank. Asking for an item that `eligible()` refuses
    to supply used to block `should_stop` forever, which is what pushed 23% of
    sessions to the 34-item ceiling. The mandate also does not apply when the
    top dimension is uncertain rather than confident — there is no claim to
    defend against acquiescence in that case.
    """
    top = top_dimension(state)
    if top is None:
        return None
    if state.branch[top] in ("genuinely-uncertain", "unresolved-mixed"):
        return None
    for item_id in state.asked:
        it = bank.items[item_id]
        if it["dimension"] == top and it.get("direction") == "reverse":
            return None
    available = eligible(bank, state, detect_contradictions(bank, state))
    for item_id in available:
        it = bank.items[item_id]
        if it["dimension"] == top and it.get("direction") == "reverse":
            return item_id
    return None


def should_stop(bank: Bank, state: State) -> str | None:
    n = len(state.asked)
    if n >= MAX_ITEMS:
        return "max-items"
    if state.quit_early:
        return "respondent-quit"
    if n < MIN_ITEMS:
        return None
    if _needs_reverse_in_top(bank, state):
        return None

    if all(state.branch[d] in TERMINAL for d in DIMENSIONS):
        return "all-branches-terminal"

    contradictions = detect_contradictions(bank, state)
    if not eligible(bank, state, contradictions):
        return "queue-empty"

    unresolved = [c for c in contradictions if c[1] in ("within-dimension", "opposite-pair-high")]
    # FIX 13: keep asking a low-confidence dimension only while there is a
    # reason to think asking will help. A flat global floor of 3 bought the
    # "never had the chance" respondents +0.31 confidence and bought everyone
    # else nothing but ten more questions. The reason is what differs, so the
    # rule tests the reason:
    #   - fewer than LOW_EXCEPTION_FLOOR scored items      -> not enough asked yet
    #   - the experience probe has not had its turn        -> the "not sure" is
    #     unexplained, and the probe that explains it is still pending
    #   - the student said "never, but I would like to try" -> the gap is real
    #     and more items in that dimension are what the design promised them
    low = [d for d in DIMENSIONS
           if confidence(state, d) < CONFIDENCE_LOW
           and state.branch[d] not in TERMINAL
           and (state.per_dimension_scored[d] < LOW_EXCEPTION_FLOOR
                or (state.uncertain_hits[d] >= 1 and d not in state.experience_asked)
                or state.experience_gap.get(d, False))]
    explored = state.explore_used >= 3 or len(state.asked) > max(EXPLORE_POSITIONS)
    if not unresolved and not low and explored:
        hist = state.confidence_history
        if len(hist) > DIMINISHING_LOOKBACK:
            delta = hist[-1] - hist[-1 - DIMINISHING_LOOKBACK]
            if delta < DIMINISHING_EPSILON:
                return "diminishing-returns"
    return None
