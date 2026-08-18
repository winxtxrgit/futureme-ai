#!/usr/bin/env python3
"""Rebuild the transport points with a mode, and drop what a student cannot board.

The first version of this file asked Wikidata for everything under "station" and
kept all of it. That set contains fifty-four airports, twenty-two ports, four
naval bases, a naval arsenal, a regasification terminal and a border checkpoint.
Used as it was — "is there a station within 2.5 km of this campus?" — it would
have told a learner they could take the train to a naval arsenal.

Every point now carries a `mode`, and only modes a student can actually travel on
are kept. The distinction that matters most is metro versus intercity rail: an
urban line is a daily commute and a State Railway station on a long-distance line
usually is not, and calling both "rail" would erase exactly the difference the
learner is trying to weigh.
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = "/Users/winter/Desktop/winter/Hackathon_TH/01_Research/Geography_and_Access/data"

MODE_BY_TYPE = {
    # Urban rail — the thing that makes a 20 km journey a normal commute.
    "metro station": "metro",
    "elevated station": "metro",
    "underground station": "metro",
    "elevated metro station": "metro",
    "underground railway station": "metro",
    "monorail station": "metro",
    "interchange station": "metro",
    # Mainline rail — useful for getting to a city, not usually for daily travel.
    "railway station": "rail",
    "railway stop": "rail",
    "junction station": "rail",
    "terminus": "rail",
    "border train station": "rail",
    "station located on surface": "rail",
    "railway station above ground": "rail",
    "airport railway station": "rail",
    "bus station": "bus",
    "bus terminus": "bus",
    "pier": "ferry",
    "ferry port": "ferry",
    "airport": "air",
    "international airport": "air",
    "domestic airport": "air",
    "commercial traffic aerodrome": "air",
    "aerodrome": "air",
    "airstrip": "air",
}

# Not passenger transport, whatever the ontology calls them.
EXCLUDE = {
    "airbase", "naval base", "naval arsenal", "military base", "port",
    "deep water port", "regasification terminal", "goods station",
    "border checkpoint", "organization", "geographical feature",
    "unfinished airport",
}

# Bangkok's urban network, named so a metro point can say which line it is on.
URBAN_LINES = re.compile(
    r"MRT|BTS|Sukhumvit Line|Silom Line|Gold Line|Airport Rail Link|"
    r"SRT Dark Red|SRT Light Red|Pink Line|Yellow Line|Purple Line|Blue Line")


def main():
    rows = json.load(open(os.path.join(HERE, "stations_raw.json")))["results"]["bindings"]
    types = json.load(open(os.path.join(HERE, "station_types.json")))["results"]["bindings"]

    type_by_qid: dict[str, set] = {}
    for row in types:
        qid = row["s"]["value"].rsplit("/", 1)[-1]
        label = row.get("typeLabel", {}).get("value", "").lower()
        type_by_qid.setdefault(qid, set()).add(label)

    stations: dict[str, dict] = {}
    for row in rows:
        qid = row["s"]["value"].rsplit("/", 1)[-1]
        match = re.match(r"Point\(([-\d.]+) ([-\d.]+)\)", row["coord"]["value"])
        if not match:
            continue
        record = stations.setdefault(qid, {
            "qid": qid,
            "en": row["en"]["value"],
            "th": row.get("th", {}).get("value"),
            "lat": float(match.group(2)),
            "lon": float(match.group(1)),
            "lines": [],
        })
        line = row.get("lineLabel", {}).get("value")
        if line and line not in record["lines"]:
            record["lines"].append(line)

    kept, dropped = [], {}
    for qid, record in stations.items():
        labels = type_by_qid.get(qid, set())
        modes = {MODE_BY_TYPE[label] for label in labels if label in MODE_BY_TYPE}

        if not modes:
            for label in labels or {"(untyped)"}:
                dropped[label] = dropped.get(label, 0) + 1
            continue
        if labels and labels <= EXCLUDE:
            for label in labels:
                dropped[label] = dropped.get(label, 0) + 1
            continue

        # A point tagged both metro and rail is an urban station on a mainline
        # alignment; for a commuting learner the urban reading is the useful one.
        mode = "metro" if "metro" in modes else sorted(modes)[0]
        line = ", ".join(record["lines"]) or None
        if mode == "rail" and line and URBAN_LINES.search(line):
            mode = "metro"

        kept.append({
            "qid": qid,
            "en": record["en"],
            "th": record["th"],
            "lat": record["lat"],
            "lon": record["lon"],
            "mode": mode,
            "line": line,
            "wikidata_types": sorted(labels),
            "source": "Wikidata (P31/P279* station, P17 Thailand)",
        })

    kept.sort(key=lambda s: (s["mode"], s["en"]))
    with open(os.path.join(DATA, "stations.json"), "w") as fh:
        json.dump(kept, fh, ensure_ascii=False, indent=1)

    counts = {}
    for station in kept:
        counts[station["mode"]] = counts.get(station["mode"], 0) + 1
    print(f"kept {len(kept)} of {len(stations)}")
    for mode, count in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"  {count:5d}  {mode}")
    print("dropped as non-passenger or untyped:")
    for label, count in sorted(dropped.items(), key=lambda x: -x[1])[:10]:
        print(f"  {count:5d}  {label}")


if __name__ == "__main__":
    main()
