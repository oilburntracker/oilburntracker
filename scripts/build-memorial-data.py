#!/usr/bin/env python3
"""
Converts the Tech for Palestine killed-in-gaza CSV into a compact JSON
for the memorial page. Each record becomes [age, sex] — the template
engine in the browser generates the description.

Source: https://data.techforpalestine.org/api/v3/killed-in-gaza.csv
"""

import csv
import json
import sys
import os
import urllib.request

CSV_URL = 'https://data.techforpalestine.org/api/v3/killed-in-gaza.csv'
OUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'memorial-data.json')

def main():
    print(f'Downloading {CSV_URL}...')
    req = urllib.request.Request(CSV_URL, headers={'User-Agent': 'OilBurnTracker/1.0'})
    with urllib.request.urlopen(req) as resp:
        with open('/tmp/killed-in-gaza.csv', 'wb') as out:
            out.write(resp.read())

    records = []
    with open('/tmp/killed-in-gaza.csv', newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            age = int(row['age']) if row['age'] else -1
            sex = 1 if row['sex'] == 'f' else 0  # 0=m, 1=f
            records.append([age, sex])

    # Sort by age for more impactful scroll experience
    # Children first, then ascending
    records.sort(key=lambda r: (r[0] if r[0] >= 0 else 999))

    output = {
        'count': len(records),
        'source': 'Tech for Palestine / Gaza Ministry of Health',
        'sourceUrl': 'https://data.techforpalestine.org/docs/killed-in-gaza/',
        'records': records
    }

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, 'w') as f:
        json.dump(output, f, separators=(',', ':'))

    size_kb = os.path.getsize(OUT_PATH) / 1024
    print(f'Wrote {len(records)} records to {OUT_PATH} ({size_kb:.0f} KB)')

if __name__ == '__main__':
    main()
