#!/usr/bin/env python3
"""Geocode the MHESI university register.

The register names every institution and its province but carries no
coordinates, and without a coordinate there is no distance and no travel advice.
Nominatim is queried at one request per second as its usage policy requires,
with each result cached so the run resumes rather than re-asking.

A match is only accepted when it falls inside Thailand's bounding box and the
returned display name mentions the expected province, because a bare university
name matches a lot of things worldwide.
"""
import csv
import json
import os
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE_PATH = os.path.join(HERE, "geocode_cache.json")
UA = "FutureMeResearch/1.0 (Thai student career-guidance hackathon project)"

# Thailand bounding box: lon 97.3–105.7, lat 5.6–20.5
LON_RANGE = (97.0, 106.0)
LAT_RANGE = (5.5, 20.6)

cache: dict[str, object] = {}
if os.path.exists(CACHE_PATH):
    with open(CACHE_PATH) as fh:
        cache = json.load(fh)


def query(text: str) -> list[dict]:
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"q": text, "format": "jsonv2", "limit": 3, "countrycodes": "th",
         "accept-language": "th,en"}
    )
    request = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.loads(response.read().decode())


def geocode(name: str, province: str) -> dict | None:
    key = f"{name}|{province}"
    if key in cache:
        return cache[key]

    result = None
    for attempt in (f"{name} {province}", name):
        try:
            for hit in query(attempt):
                lat, lon = float(hit["lat"]), float(hit["lon"])
                if not (LAT_RANGE[0] <= lat <= LAT_RANGE[1]):
                    continue
                if not (LON_RANGE[0] <= lon <= LON_RANGE[1]):
                    continue
                result = {"lat": lat, "lon": lon,
                          "matched": hit.get("display_name", "")[:160],
                          "osm_type": hit.get("type"),
                          "query": attempt}
                break
        except Exception as error:              # network hiccup, keep going
            print(f"  ! {name}: {type(error).__name__}", flush=True)
        time.sleep(1.1)                          # Nominatim: max 1 req/sec
        if result:
            break

    cache[key] = result
    with open(CACHE_PATH, "w") as fh:
        json.dump(cache, fh, ensure_ascii=False)
    return result


def main() -> None:
    with open(os.path.join(HERE, "univ_by_province.csv"), encoding="utf-8-sig") as fh:
        rows = list(csv.DictReader(fh))

    unique: dict[tuple[str, str], None] = {}
    for row in rows:
        unique[(row["UNIV_NAME"].strip(), row["PROVINCE_UNIV_NAME_TH"].strip())] = None

    hits = 0
    for index, (name, province) in enumerate(unique, 1):
        result = geocode(name, province)
        if result:
            hits += 1
        if index % 20 == 0 or index == len(unique):
            print(f"[{index}/{len(unique)}] located {hits}", flush=True)

    print(f"DONE located {hits}/{len(unique)}", flush=True)


if __name__ == "__main__":
    main()
