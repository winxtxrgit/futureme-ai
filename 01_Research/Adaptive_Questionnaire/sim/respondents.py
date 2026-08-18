#!/usr/bin/env python3
"""Synthetic respondents.

Each respondent has a latent interest level per RIASEC dimension plus a
*response style*. The styles matter more than the latent levels: the point of
the simulation is to see how the rules behave with careless, midpoint-heavy and
inexperienced answering, not only with the cooperative respondent the rules were
written for.

No claim is made that these respondents resemble Thai students. They are
adversarial test inputs, not a population model. Anything measured here is a
property of the rules, never a finding about people.
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field

DIMENSIONS = "RIASEC"

STYLES = [
    "cooperative",      # answers from latent level with small noise
    "acquiescent",      # agrees with everything, ignores content
    "midpoint",         # picks 3 almost always
    "extreme",          # only ever 1 or 5
    "inexperienced",    # 3 for anything never tried; honest where tried
    "contradictory",    # latent level unstable within a dimension
    "opposite-pair",    # two opposite dimensions both genuinely high
    "quitter",          # cooperative but stops early
]


@dataclass
class Respondent:
    rng: random.Random
    style: str
    tier: str
    latent: dict[str, float]
    tried: dict[str, bool]
    quit_at: int | None = None
    facet_bias: dict[str, float] = field(default_factory=dict)

    # -- answering ------------------------------------------------------
    def scale_answer(self, item) -> int:
        d = item["dimension"]
        style = self.style

        if style == "acquiescent":
            return self.rng.choice([4, 5, 5])
        if style == "midpoint":
            return 3 if self.rng.random() < 0.85 else self.rng.choice([2, 4])

        base = self.latent.get(d, 3.0) if d else 3.0
        base += self.facet_bias.get(item.get("facet") or "", 0.0)

        if style == "inexperienced" and d and not self.tried.get(d, False):
            return 3 if self.rng.random() < 0.8 else self.rng.choice([2, 4])
        if style == "contradictory" and d:
            base += self.rng.choice([-1.6, 1.6])

        if item.get("direction") == "reverse":
            base = 6.0 - base

        # The reverse flip has to happen before the extreme branch: a decisive
        # student answers 1 to the reverse of something they love. Applying it
        # after made every "extreme" respondent a careless one, and the engine
        # correctly scored them as untrustworthy - which looked like an engine
        # bug and was a bug in this file.
        if style == "extreme":
            return 5 if base >= 3.0 else 1
        if item["probeType"] == "intensity":
            base -= 0.5           # persistence costs something
        if item["probeType"] == "self-efficacy":
            base -= 0.8           # confidence lags interest at this age
        if item["probeType"] == "integration":
            pair = item.get("integratesPair", [])
            vals = [self.latent.get(x, 3.0) for x in pair]
            base = min(vals) if vals else 3.0
            if self.style == "opposite-pair":
                base = max(vals) if vals else 3.0

        value = round(base + self.rng.gauss(0, 0.55))
        return max(1, min(5, value))

    def choice_answer(self, item) -> str:
        options = item["options"]
        if item["probeType"] == "experience":
            d = item["dimension"]
            if self.style == "inexperienced" and not self.tried.get(d, False):
                return "never-curious"
            if self.tried.get(d, False):
                return "often" if self.latent.get(d, 3) >= 4 else "once"
            return "never-curious" if self.latent.get(d, 3) >= 3.5 else "never-uninterested"

        mapped = [(o, o.get("maps") or {}) for o in options]
        if any(m for _, m in mapped):
            def appeal(pair):
                o, m = pair
                if not m:
                    return -1.0
                return sum(self.latent.get(d, 3.0) * w for d, w in m.items()) \
                    + self.rng.gauss(0, 0.4)
            return max(mapped, key=appeal)[0]["value"]
        return self.rng.choice(options)["value"]

    def rank_answer(self, item) -> str:
        picks = self.rng.sample([o["value"] for o in item["options"]], 3)
        return ",".join(picks)

    def text_answer(self, item) -> str:
        return "" if self.rng.random() < 0.4 else "ภูมิใจตอนช่วยงานที่บ้าน"


def make(rng: random.Random, style: str | None = None) -> Respondent:
    style = style or rng.choice(STYLES)
    tier = rng.choice(["LOWER_SECONDARY", "UPPER_SECONDARY", "VOCATIONAL"])
    latent = {d: rng.uniform(1.5, 4.8) for d in DIMENSIONS}

    if style == "opposite-pair":
        d, opp = rng.choice([("R", "S"), ("I", "E"), ("A", "C")])
        latent = {x: rng.uniform(1.5, 3.2) for x in DIMENSIONS}
        latent[d] = rng.uniform(4.4, 5.0)
        latent[opp] = rng.uniform(4.4, 5.0)
    elif style == "extreme":
        latent = {x: rng.choice([1.2, 4.9]) for x in DIMENSIONS}

    tried = {d: rng.random() < 0.45 for d in DIMENSIONS}
    if style == "inexperienced":
        tried = {d: rng.random() < 0.12 for d in DIMENSIONS}

    quit_at = rng.randint(6, 20) if style == "quitter" else None

    facet_bias = {}
    if style in ("cooperative", "contradictory"):
        # some students like one facet of a dimension and not another; this is
        # the H2 case the branching rules are supposed to detect
        facet_bias = {}
    return Respondent(rng=rng, style=style, tier=tier, latent=latent,
                      tried=tried, quit_at=quit_at, facet_bias=facet_bias)
