#!/usr/bin/env python3
"""Trim the research dataset down to what a page can actually show.

The full province_access set is about eight megabytes because it keeps every
candidate the router was asked about. A learner reading a screen does not need
eighty options for their province, and shipping eighty would bury the ones they
can reach in the ones they cannot.

So: everything inside their own province, because "what exists where I live" is
the question, and then the nearest few outside it, because the answer to "and if
I am willing to travel" is only useful if it is short.

Written into the app's own data directory as a single file keyed by province, so
the page imports it on the server and the client receives rendered options
rather than a megabyte of JSON.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ACCESS = os.path.join(HERE, "..", "data", "province_access")
PROVINCES = os.path.join(HERE, "..", "data", "provinces.json")
OUT = "/Users/winter/Desktop/winter/Hackathon_TH/03_WebApp/Pre_Present/data/nearby.json"

OUTSIDE_LIMIT = 12          # how many out-of-province options are worth listing

# Bands a learner could plausibly travel to daily. Anything past this is kept
# only when it is in their own province, where "it exists here" still matters.
COMMUTABLE = {"walkable", "local", "commute", "hard_commute"}

# The access files name vehicles in Thai, which is right for the research data
# and wrong for a bilingual screen: an English reader was being shown "รถสองแถว".
# Codes travel instead, and the interface names them in whichever language the
# learner is reading.
MODE_CODES = {
    "เดิน": "walk",
    "จักรยาน": "bicycle",
    "มอเตอร์ไซค์": "motorcycle",
    "รถสองแถว": "songthaew",
    "รถเมล์": "bus",
    "รถตู้": "van",
    "รถทัวร์": "coach",
    "รถยนต์ส่วนตัว": "car",
    "รถไฟฟ้า": "metro",
    "รถไฟ": "train",
    "เครื่องบิน": "plane",
}


def main():
    provinces = {p["iso"]: p for p in json.load(open(PROVINCES))}

    # Which routes each degree institution actually runs a programme in. Absent
    # names — every vocational college — are not covered by that source and are
    # left without the field, so the app knows to fall back rather than
    # concluding the place teaches nothing.
    programmes = json.load(open(os.path.join(HERE, "..", "data", "programme_routes.json")))
    runs = programmes["institutions"]
    out = {}

    for iso in sorted(provinces):
        path = os.path.join(ACCESS, f"{iso}.json")
        if not os.path.exists(path):
            continue
        payload = json.load(open(path))

        inside, outside = [], []
        for option in payload["options"]:
            slim = {
                "id": option["id"],
                "name": option["name_th"],
                "kind": option["kind"],
                "sector": option["sector"],
                "offers": option["offers"],
                "district": option.get("district"),
                "province": option["province_th"],
                "home": option["in_home_province"],
                "km": option["road_km"],
                "minutes": option["drive_minutes"],
                "band": option["band"],
                "modes": [
                    MODE_CODES[mode]
                    for mode in option["modes_th"]
                    if mode in MODE_CODES
                ],
            }
            if option["name_th"] in runs:
                slim["runs"] = runs[option["name_th"]]

            station = option.get("nearest_station")
            if station:
                slim["station"] = {
                    "name": station["name_th"] or station["name_en"],
                    "mode": station["mode"],
                    "line": station.get("line"),
                    "km": station["km"],
                }
            (inside if option["in_home_province"] else outside).append(slim)

        outside = [o for o in outside if o["band"] in COMMUTABLE][:OUTSIDE_LIMIT]

        # Merged and sorted as one list, not home-province-first. Grouping the
        # learner's own province ahead of everything else would put a college
        # 40 km away above one 6 km across the border, inside the same travel
        # band, while the band promises they are comparable. Each row names its
        # province, so nothing is lost by ordering purely on the journey.
        merged = sorted(
            inside + outside,
            key=lambda o: (o["km"] is None, o["km"] if o["km"] is not None else 0),
        )

        province = provinces[iso]
        out[iso] = {
            "iso": iso,
            "th": province["th_short"],
            "en": province["en"],
            "counts": {
                "inside": len(inside),
                "outside": len(outside),
                "within30": sum(1 for o in merged
                                if o["km"] is not None and o["km"] <= 30),
                "vocational": sum(1 for o in merged
                                  if "ปวช." in o["offers"] or "ปวส." in o["offers"]),
                "degree": sum(1 for o in merged if "ปริญญาตรี" in o["offers"]),
                "distanceUnknown": sum(1 for o in merged if o["km"] is None),
            },
            "options": merged,
        }

    with open(OUT, "w") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))

    unknown = set()
    for province in out.values():
        for option in province["options"]:
            unknown.update(m for m in option.get("_dropped", []))
    total = sum(len(p["options"]) for p in out.values())
    print(f"provinces: {len(out)}  options: {total}  bytes: {os.path.getsize(OUT):,}")
    thin = [iso for iso, p in out.items() if p["counts"]["within30"] == 0]
    print(f"provinces with nothing inside 30 km: {len(thin)} {thin}")


if __name__ == "__main__":
    main()
