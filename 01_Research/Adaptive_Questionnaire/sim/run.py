#!/usr/bin/env python3
"""Run synthetic respondents through the rule engine and check the invariants.

    python3 run.py                 # 5000 respondents, default seed
    python3 run.py -n 20000
    python3 run.py --style acquiescent --show 1

Exit code is non-zero if any invariant fails. The invariants are the claims the
design documents make; this script is what turns them from assertions into
tested statements.
"""

from __future__ import annotations

import argparse
import random
import statistics
import sys
from collections import Counter, defaultdict

import engine as E
import respondents as R


def run_one(bank: E.Bank, person: R.Respondent) -> E.State:
    state = E.State(tier=person.tier)
    while True:
        reason = E.should_stop(bank, state)
        if reason:
            state.stop_reason = reason
            break
        item_id = E.next_item(bank, state)
        if item_id is None:
            state.stop_reason = "queue-empty-hard"
            break
        item = bank.items[item_id]
        fmt = item["responseFormat"]
        if fmt == "scale5":
            ans = E.Answer(item_id, raw=person.scale_answer(item))
        elif fmt in ("choice", "pair"):
            ans = E.Answer(item_id, choice=person.choice_answer(item))
        elif fmt == "rank3of6":
            ans = E.Answer(item_id, text=person.rank_answer(item))
        else:
            ans = E.Answer(item_id, text=person.text_answer(item))
        E.apply(bank, state, ans)
        if person.quit_at and len(state.asked) >= person.quit_at:
            state.quit_early = True
    return state


# ---------------------------------------------------------------------------
# invariants — each returns a failure string, or None
# ---------------------------------------------------------------------------

def check(bank: E.Bank, state: E.State, person: R.Respondent) -> list[str]:
    fails = []
    n = len(state.asked)

    if n > E.MAX_ITEMS:
        fails.append(f"I1 length {n} exceeds cap {E.MAX_ITEMS}")

    if len(set(state.asked)) != n:
        dupes = [i for i, c in Counter(state.asked).items() if c > 1]
        fails.append(f"I2 repeated item(s) {dupes}")

    if n < E.MIN_ITEMS and state.stop_reason != "respondent-quit":
        fails.append(f"I3 stopped at {n} (<{E.MIN_ITEMS}) with reason {state.stop_reason}")

    for key, left in state.budget.items():
        if left < 0:
            fails.append(f"I4 budget {key} went negative ({left})")

    # I5 no dimension may be pruned on the strength of a single answer
    for d in E.DIMENSIONS:
        if state.branch[d] == "pruned":
            negs = [a for a in state.answers
                    if bank.items[a.item_id]["dimension"] == d
                    and bank.items[a.item_id]["scoring"] == "dimension"
                    and a.raw in (1, 2)]
            facets = {bank.items[a.item_id]["facet"] for a in negs}
            strong = any(bank.items[a.item_id]["diagnosticStrength"] == "high" for a in negs)
            if len(negs) < 2 or len(facets) < 2 or not strong:
                fails.append(f"I5 {d} pruned on {len(negs)} negative(s), "
                             f"{len(facets)} facet(s), high={strong}")
            if any(a.raw in (4, 5) for a in state.answers
                   if bank.items[a.item_id]["dimension"] == d
                   and bank.items[a.item_id]["scoring"] == "dimension"):
                fails.append(f"I5 {d} pruned despite a positive answer")

    # I6 a dimension may be reopened at most once
    for d, c in Counter(state.reopened).items():
        if c > 1:
            fails.append(f"I6 {d} reopened {c} times")

    # I7 per-dimension and per-facet caps. The cap governs *scored* items;
    # context probes about a dimension get a separate allowance of 3 (FIX 3).
    for d, c in state.per_dimension_scored.items():
        if c > E.MAX_PER_DIMENSION:
            fails.append(f"I7 dimension {d} got {c} scored items (cap {E.MAX_PER_DIMENSION})")
    for d, c in state.per_dimension_count.items():
        if c > E.MAX_PER_DIMENSION + 3:
            fails.append(f"I7 dimension {d} got {c} items total (cap {E.MAX_PER_DIMENSION + 3})")
    for f, c in state.per_facet_count.items():
        if c > E.MAX_PER_FACET:
            fails.append(f"I7 facet {f} got {c} items (cap {E.MAX_PER_FACET})")

    # I8 clarification budget
    if state.clarify_asked > E.MAX_CLARIFY_TOTAL:
        fails.append(f"I8 {state.clarify_asked} clarify items (cap {E.MAX_CLARIFY_TOTAL})")

    # I9 a completed session carries a reverse item in its top dimension.
    # Exempt sessions that ran into the hard ceiling: the mandate is about the
    # *final* top dimension, and the final answer can change which dimension
    # that is, leaving no room to satisfy it. The residual rate is reported
    # rather than hidden - see sim/README.md.
    if state.stop_reason not in ("respondent-quit", "max-items") and n >= E.MIN_ITEMS:
        top = E.top_dimension(state)
        if top and E._needs_reverse_in_top(bank, state):
            fails.append(f"I9 finished without a reverse item in top dimension {top}")

    # I10 no item that must never be scored contributed to a score
    for a in state.answers:
        it = bank.items[a.item_id]
        if it["scoring"] == "none" and "diagnosticWeight" in it:
            fails.append(f"I10 {a.item_id} is unscored but carries a weight")

    return fails


def summarise(bank: E.Bank, results: list[tuple[R.Respondent, E.State]]) -> None:
    lengths = [len(s.asked) for _, s in results]
    print(f"\nsessions: {len(results)}")
    print(f"length   min {min(lengths)}  median {int(statistics.median(lengths))}  "
          f"mean {statistics.mean(lengths):.1f}  max {max(lengths)}")

    by_style = defaultdict(list)
    for p, s in results:
        by_style[p.style].append(len(s.asked))
    print("\nlength by respondent style")
    for style in sorted(by_style):
        v = by_style[style]
        print(f"  {style:<15} n={len(v):<6} min {min(v):>2}  "
              f"median {int(statistics.median(v)):>2}  max {max(v):>2}")

    print("\nstop reason")
    for reason, c in Counter(s.stop_reason for _, s in results).most_common():
        print(f"  {reason:<24} {c:>6}  ({100*c/len(results):.1f}%)")

    print("\nfinal branch status (share of all dimension-slots)")
    total = len(results) * 6
    for status, c in Counter(s.branch[d] for _, s in results
                             for d in E.DIMENSIONS).most_common():
        print(f"  {status:<22} {c:>7}  ({100*c/total:.1f}%)")

    print("\nprobe type mix (mean items per session)")
    counts = Counter(bank.items[i]["probeType"] for _, s in results for i in s.asked)
    for pt, c in counts.most_common():
        print(f"  {pt:<20} {c/len(results):.2f}")

    used = {i for _, s in results for i in s.asked}
    unused = [i for i in bank.order if i not in used]
    print(f"\nbank coverage: {len(used)}/{len(bank.items)} items ever asked")
    if unused:
        print("  never asked: " + ", ".join(unused))

    facets_used = {bank.items[i]["facet"] for _, s in results for i in s.asked
                   if bank.items[i]["facet"]}
    print(f"facet coverage: {len(facets_used)}/{len(bank.facets)}")

    conf = [E.confidence(s, E.top_dimension(s)) for _, s in results
            if E.top_dimension(s)]
    print(f"\nconfidence in top dimension: median {statistics.median(conf):.2f}  "
          f"below 0.40 in {100*sum(1 for c in conf if c < 0.40)/len(conf):.1f}% of sessions")

    print("\nconfidence in top dimension, by respondent style")
    for style in sorted(by_style):
        cs = [E.confidence(s, E.top_dimension(s)) for p, s in results
              if p.style == style and E.top_dimension(s)]
        print(f"  {style:<15} median {statistics.median(cs):.2f}   "
              f"reaches 0.75 in {100*sum(1 for c in cs if c >= 0.75)/len(cs):.0f}% of sessions")

    missed = sum(1 for _, s in results
                 if s.stop_reason == "max-items" and E._needs_reverse_in_top(bank, s))
    print(f"\nhit the 34-item ceiling with the reverse-item mandate unmet: {missed} "
          f"({100*missed/len(results):.2f}%)")

    low_diff = sum(1 for _, s in results if s.profile_consistency == "low")
    print(f"low-consistency (opposite-pair) profiles flagged: {low_diff} "
          f"({100*low_diff/len(results):.1f}%)")


def show_one(bank: E.Bank, person: R.Respondent, state: E.State) -> None:
    print(f"\n--- one session · style={person.style} · tier={person.tier} ---")
    print("latent: " + "  ".join(f"{d}={person.latent[d]:.1f}" for d in E.DIMENSIONS))
    for n, (item_id, a) in enumerate(zip(state.asked, state.answers), 1):
        it = bank.items[item_id]
        val = a.raw if a.raw is not None else (a.choice or a.text or "")
        print(f"{n:>3}  {item_id:<14} {it['probeType']:<18} "
              f"{str(it['dimension'] or '-'):<2} -> {val}")
    print("stop: " + str(state.stop_reason))
    print("branch: " + "  ".join(f"{d}={state.branch[d]}" for d in E.DIMENSIONS))
    print("conf:   " + "  ".join(f"{d}={E.confidence(state, d):.2f}" for d in E.DIMENSIONS))


def sweep(bank: E.Bank, args) -> int:
    """05 §5.3 promised a sensitivity analysis on the developer-set constants.
    This is it: nothing here is a recommendation, it is the shape of the
    trade-off between length and how much the system claims to know."""
    print("epsilon  floor |  median len   p90 len  |  median conf(top)  cap-hit%")
    print("-" * 72)
    for floor in (1, 2, 3):
        for eps in (0.01, 0.03, 0.06, 0.10):
            E.LOW_EXCEPTION_FLOOR = floor
            E.DIMINISHING_EPSILON = eps
            rng = random.Random(args.seed)
            lengths, confs, capped = [], [], 0
            for _ in range(args.n):
                person = R.make(random.Random(rng.getrandbits(64)), args.style)
                st = run_one(bank, person)
                if person.style == "quitter":
                    continue
                lengths.append(len(st.asked))
                top = E.top_dimension(st)
                if top:
                    confs.append(E.confidence(st, top))
                capped += st.stop_reason == "max-items"
            lengths.sort()
            print(f"  {eps:<6} {floor:<5} |   {statistics.median(lengths):>5.0f}     "
                  f"{lengths[int(0.9*len(lengths))]:>5}   |      {statistics.median(confs):.2f}"
                  f"        {100*capped/len(lengths):.0f}%")
    E.LOW_EXCEPTION_FLOOR, E.DIMINISHING_EPSILON = 3, 0.03
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("-n", type=int, default=5000)
    ap.add_argument("--seed", type=int, default=20260809)
    ap.add_argument("--style", default=None, choices=R.STYLES)
    ap.add_argument("--show", type=int, default=0, help="print this many full sessions")
    ap.add_argument("--sweep", action="store_true",
                    help="sensitivity analysis over the two constants that drive length")
    args = ap.parse_args()

    bank = E.Bank()

    if args.sweep:
        return sweep(bank, args)

    rng = random.Random(args.seed)
    results, failures = [], []

    for _ in range(args.n):
        person = R.make(random.Random(rng.getrandbits(64)), args.style)
        state = run_one(bank, person)
        results.append((person, state))
        for f in check(bank, state, person):
            failures.append((person.style, f))

    for person, state in results[:args.show]:
        show_one(bank, person, state)

    summarise(bank, results)

    print()
    if failures:
        print(f"INVARIANT FAILURES: {len(failures)} across {args.n} sessions")
        for (style, msg), c in Counter(failures).most_common(20):
            print(f"  [{style}] {msg}   ×{c}")
        return 1
    print(f"all invariants hold across {args.n} sessions")
    return 0


if __name__ == "__main__":
    sys.exit(main())
