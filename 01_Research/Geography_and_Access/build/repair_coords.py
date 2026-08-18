#!/usr/bin/env python3
"""Validate every institution coordinate, and repair one only when it can prove itself.

The registers contain a handful of coordinates that are not coordinates: axes
swapped, a decimal point lost, and in one case a UTM grid reference left in a
latitude/longitude column. A wrong coordinate is worse here than a missing one,
because a missing one shows up as "unknown" while a wrong one quietly produces a
confident distance and a travel recommendation to somewhere the college is not.

So repairs are proposed, then tested, never assumed. Each candidate
reconstruction has to land within `MAX_KM_FROM_CENTROID` of the centre of the
province the register itself assigns. A reconstruction that cannot pass is not
used, and the record is quarantined with its original value kept for inspection.

`coord_status` on every record says which of these happened, so nothing
downstream has to guess how much to trust a point.
"""
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = "/Users/winter/Desktop/winter/Hackathon_TH/01_Research/Geography_and_Access/data"

LAT_RANGE = (5.5, 20.6)
LON_RANGE = (97.0, 106.0)
MAX_KM_FROM_CENTROID = 130      # Thai provinces are small; this is generous


def haversine(lat1, lon1, lat2, lon2):
    radius = 6371.0
    dlat, dlon = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1))
         * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    return 2 * radius * math.asin(math.sqrt(a))


def utm47n_to_latlon(easting, northing):
    """Inverse UTM for zone 47N, which covers most of Thailand."""
    k0, a, f = 0.9996, 6378137.0, 1 / 298.257223563
    e2 = f * (2 - f)
    e1 = (1 - math.sqrt(1 - e2)) / (1 + math.sqrt(1 - e2))
    mu = (northing / k0) / (a * (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256))
    phi = (mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * math.sin(2 * mu)
           + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * math.sin(4 * mu)
           + (151 * e1 ** 3 / 96) * math.sin(6 * mu))
    c1 = (e2 / (1 - e2)) * math.cos(phi) ** 2
    t1 = math.tan(phi) ** 2
    n1 = a / math.sqrt(1 - e2 * math.sin(phi) ** 2)
    r1 = a * (1 - e2) / (1 - e2 * math.sin(phi) ** 2) ** 1.5
    d = (easting - 500000) / (n1 * k0)
    lat = phi - (n1 * math.tan(phi) / r1) * (d ** 2 / 2 - (5 + 3 * t1 + 10 * c1) * d ** 4 / 24)
    lon = (d - (1 + 2 * t1 + c1) * d ** 3 / 6) / math.cos(phi)
    # Central meridian of zone 47 is 6 × 47 − 183 = 99°E.
    return math.degrees(lat), 99.0 + math.degrees(lon)


def in_thailand(lat, lon):
    return LAT_RANGE[0] <= lat <= LAT_RANGE[1] and LON_RANGE[0] <= lon <= LON_RANGE[1]


def candidates(lat, lon):
    """Every reconstruction worth testing, each with the fault it assumes."""
    yield "as_given", lat, lon
    yield "swapped_axes", lon, lat

    # A decimal point dropped somewhere. Try each plausible divisor rather than
    # assuming both columns lost it in the same place — they demonstrably did not.
    scales = (1, 10, 100, 1_000, 10_000, 100_000, 1_000_000, 10_000_000)
    for lat_scale in scales:
        for lon_scale in scales:
            if lat_scale == 1 and lon_scale == 1:
                continue
            yield f"rescaled_{lat_scale}_{lon_scale}", lat / lat_scale, lon / lon_scale

    if 100_000 < lat < 1_000_000 and 100_000 < lon < 10_000_000:
        converted = utm47n_to_latlon(lat, lon)
        yield "utm47n_easting_northing", converted[0], converted[1]
    if 100_000 < lon < 1_000_000 and 100_000 < lat < 10_000_000:
        converted = utm47n_to_latlon(lon, lat)
        yield "utm47n_northing_easting", converted[0], converted[1]


def main():
    institutions = json.load(open(os.path.join(DATA, "institutions.json")))
    provinces = {p["iso"]: p for p in json.load(open(os.path.join(DATA, "provinces.json")))}

    repaired, quarantined, clean, missing = 0, [], 0, 0
    for record in institutions:
        lat, lon = record.get("lat"), record.get("lon")
        province = provinces[record["province_iso"]]

        if lat is None or lon is None:
            record["coord_status"] = "missing"
            missing += 1
            continue

        if in_thailand(lat, lon):
            gap = haversine(lat, lon, province["lat"], province["lon"])
            if gap <= MAX_KM_FROM_CENTROID:
                record["coord_status"] = "register"
                clean += 1
                continue

        best = None
        for label, candidate_lat, candidate_lon in candidates(lat, lon):
            if not in_thailand(candidate_lat, candidate_lon):
                continue
            gap = haversine(candidate_lat, candidate_lon, province["lat"], province["lon"])
            if gap <= MAX_KM_FROM_CENTROID and (best is None or gap < best[0]):
                best = (gap, label, candidate_lat, candidate_lon)

        if best and best[1] != "as_given":
            gap, label, new_lat, new_lon = best
            record["coord_original"] = {"lat": lat, "lon": lon}
            record["lat"], record["lon"] = round(new_lat, 6), round(new_lon, 6)
            record["coord_status"] = "register_repaired"
            record["coord_repair"] = label
            record["coord_km_from_province_centre"] = round(gap, 1)
            repaired += 1
        elif best:
            record["coord_status"] = "register"
            clean += 1
        else:
            record["coord_original"] = {"lat": lat, "lon": lon}
            record["lat"], record["lon"] = None, None
            record["coord_status"] = "quarantined"
            quarantined.append({
                "id": record["id"], "name_th": record["name_th"],
                "province_th": record["province_th"],
                "given": {"lat": lat, "lon": lon},
                "reason": "no reconstruction landed inside the assigned province",
            })

    # A register that writes "-" for "we have no website" is writing a value,
    # not a blank, and it renders as a broken link if taken literally.
    scrubbed = 0
    for record in institutions:
        for field in ("website", "phone", "district", "subdistrict"):
            value = record.get(field)
            if isinstance(value, str) and value.strip() in {"-", "--", "n/a", "N/A", ""}:
                record[field] = None
                scrubbed += 1

    with open(os.path.join(DATA, "institutions.json"), "w") as fh:
        json.dump(institutions, fh, ensure_ascii=False, indent=1)
    with open(os.path.join(DATA, "quarantine_coordinates.json"), "w") as fh:
        json.dump(quarantined, fh, ensure_ascii=False, indent=1)

    print(f"clean {clean} | repaired {repaired} | quarantined {len(quarantined)} | missing {missing}")
    print(f"placeholder values scrubbed: {scrubbed}")
    for record in institutions:
        if record.get("coord_status") == "register_repaired":
            print(f"  repaired [{record['coord_repair']}] {record['name_th'][:40]} "
                  f"({record['province_th']}) -> {record['lat']}, {record['lon']} "
                  f"[{record['coord_km_from_province_centre']} km from centre]")
    for row in quarantined:
        print(f"  QUARANTINED {row['name_th'][:40]} ({row['province_th']}) {row['given']}")


if __name__ == "__main__":
    main()
