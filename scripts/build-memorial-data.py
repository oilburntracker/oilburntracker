#!/usr/bin/env python3
"""
Builds the memorial dataset from multiple sources:
1. Gaza — Tech for Palestine killed-in-gaza (60K individual records)
2. West Bank — Tech for Palestine daily aggregates (~1,050 killed)
3. Lebanon — Lebanese MoH aggregate figures (~4,047 killed)
4. Israel (Oct 7) — known aggregate (~1,139 civilians)

Each record: [age, sex, region, date_info]
- age: integer (-1 if unknown)
- sex: 0=male, 1=female
- region: 0=Gaza, 1=WestBank, 2=Lebanon, 3=Israel
- date_info: approximate date string or "" if unknown
"""

import csv
import json
import os
import random
import urllib.request

OUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'memorial-data.json')

# MoH list update → approximate death date range (end date)
UPDATE_TO_DATE = {
    '1': '2023-10-24',  # List 1: through Oct 24, 2023
    '2': '2024-01-05',  # List 2: through Jan 5, 2024
    '3': '2024-03-29',  # List 3: through Mar 29, 2024
    '4': '2024-04-30',  # List 4: through Apr 30, 2024
    '5': '2024-06-30',  # List 5: through Jun 30, 2024
    '6': '2024-08-31',  # List 6: through Aug 31, 2024
    '7': '2024-10-07',  # List 7: through Oct 7, 2024
    '8': '2025-03-23',  # List 8: through Mar 23, 2025
    '9': '2025-06-15',  # List 9: through Jun 15, 2025
}

# Start dates for each list period (deaths between start and end)
UPDATE_START = {
    '1': '2023-10-07',
    '2': '2023-10-25',
    '3': '2024-01-06',
    '4': '2024-03-30',
    '5': '2024-05-01',
    '6': '2024-07-01',
    '7': '2024-09-01',
    '8': '2024-10-08',
    '9': '2025-03-24',
}

REGIONS = ['Gaza', 'West Bank', 'Lebanon', 'Israel']

def fetch_csv(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'OilBurnTracker/1.0'})
    with urllib.request.urlopen(req) as resp:
        return resp.read().decode('utf-8')

def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'OilBurnTracker/1.0'})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def build_gaza():
    """60K individual records with age, sex, approximate date."""
    print('Fetching Gaza killed-in-gaza CSV...')
    text = fetch_csv('https://data.techforpalestine.org/api/v3/killed-in-gaza.csv')
    records = []
    reader = csv.DictReader(text.strip().split('\n'))
    for row in reader:
        age = int(row['age']) if row['age'] else -1
        sex = 1 if row['sex'] == 'f' else 0
        update = row.get('update', '')
        date = UPDATE_TO_DATE.get(update, '')
        records.append([age, sex, 0, date])  # 0 = Gaza
    print(f'  Gaza: {len(records)} records')
    return records

def build_west_bank():
    """~1,050 killed — generate from daily aggregates + demographics."""
    print('Fetching West Bank daily data...')
    data = fetch_json('https://data.techforpalestine.org/api/v2/west_bank_daily.min.json')

    records = []
    prev_killed = 0
    # Known demographics: ~21% children, ~5% women, rest adult males
    # Source: OCHA reports
    rng = random.Random(42)  # Deterministic

    for day in data:
        date = day.get('report_date', '')
        killed_cum = 0
        if 'verified' in day and isinstance(day['verified'], dict):
            killed_cum = day['verified'].get('killed_cum', 0) or 0
        if not killed_cum:
            killed_cum = day.get('killed_cum', 0) or 0

        new_killed = killed_cum - prev_killed
        if new_killed > 0:
            for _ in range(new_killed):
                # Demographics approximation
                r = rng.random()
                if r < 0.21:  # 21% children
                    age = rng.randint(1, 17)
                    sex = rng.choice([0, 1])
                elif r < 0.26:  # 5% women
                    age = rng.randint(18, 55)
                    sex = 1
                else:  # 74% adult males
                    age = rng.randint(18, 55)
                    sex = 0
                records.append([age, sex, 1, date])  # 1 = West Bank
        prev_killed = killed_cum

    print(f'  West Bank: {len(records)} records')
    return records

def build_lebanon():
    """~4,047 killed — generate from known demographics."""
    print('Building Lebanon entries from aggregate data...')
    # Source: Lebanese MoH — 4,047 killed, 86% male, 8% children (~316),
    # 20% women (~790), age distribution estimated from MoH reports
    total = 4047
    rng = random.Random(43)

    # Date distribution: most casualties Sep-Nov 2024 (Israeli offensive)
    # Then sporadic through ceasefire and after
    date_weights = [
        ('2023-10-08', '2024-09-16', 0.05),   # Sporadic border clashes
        ('2024-09-17', '2024-09-30', 0.25),    # Pager attacks + escalation
        ('2024-10-01', '2024-10-31', 0.35),    # Full Israeli offensive
        ('2024-11-01', '2024-11-26', 0.25),    # Continued operations
        ('2024-11-27', '2025-12-31', 0.10),    # Post-ceasefire
    ]

    def random_date_in_range(start, end):
        from datetime import datetime, timedelta
        s = datetime.strptime(start, '%Y-%m-%d')
        e = datetime.strptime(end, '%Y-%m-%d')
        delta = (e - s).days
        return (s + timedelta(days=rng.randint(0, max(delta, 1)))).strftime('%Y-%m-%d')

    records = []
    for _ in range(total):
        # Demographics
        r = rng.random()
        if r < 0.08:  # 8% children
            age = rng.randint(1, 17)
            sex = rng.choice([0, 1])
        elif r < 0.28:  # 20% women
            age = rng.randint(18, 65)
            sex = 1
        else:  # 72% adult males (many Hezbollah fighters)
            age = rng.randint(18, 55)
            sex = 0

        # Date
        wr = rng.random()
        cumulative = 0
        date = ''
        for start, end, weight in date_weights:
            cumulative += weight
            if wr <= cumulative:
                date = random_date_in_range(start, end)
                break

        records.append([age, sex, 2, date])  # 2 = Lebanon

    print(f'  Lebanon: {len(records)} records')
    return records

def build_israel():
    """~1,139 civilians killed Oct 7 + subsequent."""
    print('Building Israel entries from aggregate data...')
    # Source: Israeli gov — 1,139 killed Oct 7 (695 civilians, 373 security, 71 foreign)
    # + soldiers killed in subsequent operations (~400+)
    # Demographics Oct 7: wide age range, ~40% women among civilians
    rng = random.Random(44)

    records = []

    # Oct 7 attack — 1,139 killed
    for _ in range(1139):
        r = rng.random()
        if r < 0.06:  # children
            age = rng.randint(1, 17)
            sex = rng.choice([0, 1])
        elif r < 0.40:  # women
            age = rng.randint(18, 75)
            sex = 1
        elif r < 0.73:  # civilian men
            age = rng.randint(18, 80)
            sex = 0
        else:  # security forces (mostly young men)
            age = rng.randint(19, 35)
            sex = 0
        records.append([age, sex, 3, '2023-10-07'])  # 3 = Israel

    # IDF soldiers killed in subsequent Gaza/Lebanon operations (~400+)
    for _ in range(400):
        age = rng.randint(19, 35)
        sex = 0 if rng.random() > 0.03 else 1  # ~3% women in combat
        # Distributed across the war period
        from datetime import datetime, timedelta
        days = rng.randint(1, 800)
        date = (datetime(2023, 10, 8) + timedelta(days=days)).strftime('%Y-%m-%d')
        records.append([age, sex, 3, date])

    print(f'  Israel: {len(records)} records')
    return records

def main():
    gaza = build_gaza()
    west_bank = build_west_bank()
    lebanon = build_lebanon()
    israel = build_israel()

    # Combine all records
    all_records = gaza + west_bank + lebanon + israel

    # Sort by date (entries with dates first, then by date)
    all_records.sort(key=lambda r: (r[3] if r[3] else 'zzzz', r[0] if r[0] >= 0 else 999))

    output = {
        'count': len(all_records),
        'regions': REGIONS,
        'sources': {
            'gaza': 'Tech for Palestine / Gaza Ministry of Health',
            'west_bank': 'Tech for Palestine / OCHA',
            'lebanon': 'Lebanese Ministry of Health',
            'israel': 'Israeli Government / Emergency Services',
        },
        'records': all_records
    }

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, 'w') as f:
        json.dump(output, f, separators=(',', ':'))

    size_kb = os.path.getsize(OUT_PATH) / 1024
    print(f'\nTotal: {len(all_records)} records')
    print(f'  Gaza: {len(gaza)}')
    print(f'  West Bank: {len(west_bank)}')
    print(f'  Lebanon: {len(lebanon)}')
    print(f'  Israel: {len(israel)}')
    print(f'Written to {OUT_PATH} ({size_kb:.0f} KB)')

if __name__ == '__main__':
    main()
