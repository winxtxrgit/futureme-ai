#!/usr/bin/env python3
"""Turn coordinates into an answer to "how would I actually get there every day".

Distance alone does not help a fifteen-year-old decide anything. 40 km means one
thing on a Bangkok train line and something else entirely on a provincial road
with no bus, and the difference decides whether a place is a commute or a move
away from home. So every option is measured by road — not straight line — and
then placed in a band that names what the journey would be.

Road distance and driving time come from OSRM. Straight-line distance is used
only to choose which institutions are worth asking about, never to report.
"""
import json
import math
import os
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = "/Users/winter/Desktop/winter/Hackathon_TH/01_Research/Geography_and_Access"
DATA = os.path.join(ROOT, "data")
ACCESS = os.path.join(DATA, "province_access")
os.makedirs(ACCESS, exist_ok=True)

OSRM = "https://router.project-osrm.org/table/v1/driving/"
MAX_DESTINATIONS = 80          # public OSRM accepts ~100 coordinates per call
CONSIDER_KM = 160              # straight-line cut-off for "worth asking about"

# ── The bands ────────────────────────────────────────────────────────────────
# Boundaries are judgement, not measurement, and are written down here so they
# can be argued with rather than hidden inside a number. They describe a daily
# journey made twice, by a student who usually cannot drive a car.
BANDS = [
    (3, "walkable", "เดินหรือปั่นจักรยานไปได้",
     ["เดิน", "จักรยาน", "มอเตอร์ไซค์"]),
    (10, "local", "ไปกลับทุกวันได้ตามปกติ",
     ["มอเตอร์ไซค์", "รถสองแถว", "รถเมล์"]),
    (30, "commute", "ไปกลับได้ แต่กินเวลาและค่าเดินทางทุกวัน",
     ["มอเตอร์ไซค์", "รถสองแถว", "รถตู้", "รถเมล์"]),
    (80, "hard_commute", "ไปกลับทุกวันเหนื่อยมาก ควรคิดเรื่องหอพักด้วย",
     ["รถตู้", "รถทัวร์", "รถยนต์ส่วนตัว"]),
    (10_000, "relocate", "ต้องย้ายไปอยู่ที่นั่น ไม่ใช่การเดินทางประจำวัน",
     ["รถทัวร์", "รถไฟ", "เครื่องบิน"]),
]


def band_for(km):
    for limit, code, label, modes in BANDS:
        if km <= limit:
            return code, label, modes
    return BANDS[-1][1], BANDS[-1][2], BANDS[-1][3]


def haversine(lat1, lon1, lat2, lon2):
    radius = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
         * math.sin(dlon / 2) ** 2)
    return 2 * radius * math.asin(math.sqrt(a))


def osrm_table(origin, destinations):
    """Road distance and driving time from one origin to many destinations."""
    coords = ";".join(
        f"{lon},{lat}" for lat, lon in [origin] + destinations
    )
    url = (OSRM + coords + "?" +
           urllib.parse.urlencode({"sources": "0", "annotations": "distance,duration"}))
    for attempt in range(4):
        try:
            request = urllib.request.Request(
                url, headers={"User-Agent": "FutureMeResearch/1.0 (student project)"})
            with urllib.request.urlopen(request, timeout=120) as response:
                payload = json.loads(response.read().decode())
            if payload.get("code") == "Ok":
                return payload["distances"][0], payload["durations"][0]
        except Exception as error:
            print(f"    osrm attempt {attempt + 1}: {type(error).__name__}", flush=True)
        time.sleep(4 * (attempt + 1))
    return None, None


def main():
    provinces = json.load(open(os.path.join(HERE, "provinces.json")))
    institutions = json.load(open(os.path.join(DATA, "institutions.json")))
    stations = json.load(open(os.path.join(DATA, "stations.json")))

    located = [i for i in institutions if i.get("lat") and i.get("lon")]
    print(f"{len(located)} institutions have coordinates")

    index = []
    for number, province in enumerate(provinces, 1):
        out_path = os.path.join(ACCESS, f"{province['iso']}.json")
        if os.path.exists(out_path):
            index.append(json.load(open(out_path))["summary"])
            continue

        # The geometric centre of a long province can sit 90 km from where
        # anyone lives: Kanchanaburi's is 92 km from its city, Lampang's 50 km,
        # and both reported that nothing was reachable when in fact their
        # technical college is in town. Institutions cluster in the capital, so
        # that is the origin. For most provinces the two are within a kilometre.
        origin = (province["origin_lat"], province["origin_lon"])

        # Everything in the province, plus anything near enough elsewhere to be
        # a real alternative. Ranked by straight line only to decide who to ask
        # OSRM about; the answer reported is always the road one.
        candidates = []
        for institution in located:
            straight = haversine(origin[0], origin[1], institution["lat"], institution["lon"])
            same = institution["province_iso"] == province["iso"]
            if same or straight <= CONSIDER_KM:
                candidates.append((straight, same, institution))
        candidates.sort(key=lambda row: (not row[1], row[0]))
        candidates = candidates[:MAX_DESTINATIONS]

        distances, durations = osrm_table(
            origin, [(c[2]["lat"], c[2]["lon"]) for c in candidates])

        options = []
        for position, (straight, same, institution) in enumerate(candidates, start=1):
            metres = distances[position] if distances else None
            seconds = durations[position] if durations else None
            km = round(metres / 1000, 1) if metres else round(straight, 1)
            code, label, modes = band_for(km)

            # Only what a learner can commute on, and at the range each is
            # actually useful: an urban station two kilometres away is part of
            # the journey, a mainline station three kilometres away is how you
            # reach the city in the first place. Airports, ports and freight
            # yards are not travel options for getting to class and are not in
            # the station file at all any more.
            near_station = None
            for reach, wanted in ((2.0, "metro"), (3.0, "rail")):
                best, chosen = reach, None
                for candidate in stations:
                    if candidate["mode"] != wanted:
                        continue
                    gap = haversine(institution["lat"], institution["lon"],
                                    candidate["lat"], candidate["lon"])
                    if gap < best:
                        best, chosen = gap, candidate
                if chosen:
                    near_station = {"name_th": chosen["th"], "name_en": chosen["en"],
                                    "mode": chosen["mode"], "line": chosen.get("line"),
                                    "km": round(best, 1)}
                    modes = (["รถไฟฟ้า"] if wanted == "metro" else ["รถไฟ"]) + modes
                    break

            options.append({
                "id": institution["id"],
                "name_th": institution["name_th"],
                "kind": institution["kind"],
                "sector": institution["sector"],
                "offers": institution["offers"],
                "province_iso": institution["province_iso"],
                "province_th": institution["province_th"],
                "district": institution.get("district"),
                "in_home_province": same,
                "road_km": km,
                "road_km_is_estimate": metres is None,
                "drive_minutes": round(seconds / 60) if seconds else None,
                "band": code,
                "band_th": label,
                "modes_th": modes,
                "nearest_station": near_station,
                "phone": institution.get("phone"),
                "website": institution.get("website"),
                "coord_source": institution.get("coord_source"),
            })

        # An institution whose coordinate is missing or quarantined still exists,
        # and the register is reliable about which province it is in. Dropping it
        # would tell a learner in Loei that there is no Rajabhat university in
        # Loei, which is a worse error than not knowing how far away it is.
        for institution in institutions:
            if institution["province_iso"] != province["iso"]:
                continue
            if institution.get("lat") and institution.get("lon"):
                continue
            options.append({
                "id": institution["id"],
                "name_th": institution["name_th"],
                "kind": institution["kind"],
                "sector": institution["sector"],
                "offers": institution["offers"],
                "province_iso": institution["province_iso"],
                "province_th": institution["province_th"],
                "district": institution.get("district"),
                "in_home_province": True,
                "road_km": None,
                "road_km_is_estimate": True,
                "drive_minutes": None,
                "band": "unknown_distance",
                "band_th": "อยู่ในจังหวัดนี้ แต่ยังไม่มีพิกัดที่เชื่อถือได้ จึงยังบอกระยะทางไม่ได้",
                "modes_th": [],
                "nearest_station": None,
                "phone": institution.get("phone"),
                "website": institution.get("website"),
                "coord_source": institution.get("coord_status"),
            })

        options.sort(key=lambda o: (o["road_km"] is None, o["road_km"] or 0))
        summary = {
            "iso": province["iso"],
            "province_th": province["th_short"],
            "province_en": province["en"],
            "options_total": len(options),
            "in_province": sum(1 for o in options if o["in_home_province"]),
            "within_30km": sum(1 for o in options if o["road_km"] is not None and o["road_km"] <= 30),
            "offers_vocational": sum(1 for o in options
                                     if "ปวช." in o["offers"] or "ปวส." in o["offers"]),
            "offers_degree": sum(1 for o in options if "ปริญญาตรี" in o["offers"]),
            "distance_unknown": sum(1 for o in options if o["road_km"] is None),
        }
        payload = {
            "summary": summary,
            "origin": {
                "lat": province["origin_lat"], "lon": province["origin_lon"],
                "kind": province["origin_kind"],
                "note": "จุดอ้างอิงคืออำเภอเมืองของจังหวัด ไม่ใช่บ้านของผู้เรียน "
                        "ระยะจริงจากบ้านต่างจากนี้ได้มาก",
            },
            "options": options,
        }
        with open(out_path, "w") as fh:
            json.dump(payload, fh, ensure_ascii=False, indent=1)
        index.append(summary)
        print(f"[{number}/{len(provinces)}] {province['iso']} {province['en']}: "
              f"{len(options)} options, {summary['within_30km']} within 30km", flush=True)
        time.sleep(1.5)

    with open(os.path.join(DATA, "province_index.json"), "w") as fh:
        json.dump(index, fh, ensure_ascii=False, indent=1)
    print("index written:", len(index))


if __name__ == "__main__":
    main()
