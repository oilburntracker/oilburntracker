export type EventCategory =
  | 'military_strike'
  | 'facility_damage'
  | 'chokepoint'
  | 'diplomatic'
  | 'escalation'
  | 'retaliation'
  | 'humanitarian';

export interface ConflictEvent {
  id: string;
  date: string;                    // ISO date
  time?: string;                   // HH:MM local time (for fast-moving days)
  title: string;
  category: EventCategory;
  description: string;
  facilityId?: string;             // links to curated-fires.ts
  lat?: number;
  lng?: number;
  zoom?: number;
  sourceUrl?: string;
  mediaUrls?: {
    type: 'youtube' | 'twitter' | 'news';
    url: string;
    label?: string;
  }[];
  casualties?: {
    killed?: number;
    injured?: number;
    displaced?: number;
    source?: string;
    killedAdjusted?: number;
    adjustedSource?: string;
    children?: number;
  };
  movements?: {
    type: 'displacement' | 'military' | 'supply_disruption';
    from: [number, number];
    to: [number, number];
    label?: string;
    volume?: number;
  }[];
}

const CATEGORY_LABELS: Record<EventCategory, string> = {
  military_strike: 'Military Strike',
  facility_damage: 'Facility Damage',
  chokepoint: 'Chokepoint Threat',
  diplomatic: 'Diplomatic',
  escalation: 'Escalation',
  retaliation: 'Retaliation',
  humanitarian: 'Humanitarian Crisis'
};

const CATEGORY_COLORS: Record<EventCategory, string> = {
  military_strike: '#ef4444',
  facility_damage: '#f97316',
  chokepoint: '#eab308',
  diplomatic: '#3b82f6',
  escalation: '#a855f7',
  retaliation: '#ec4899',
  humanitarian: '#6b7280'
};

export { CATEGORY_LABELS, CATEGORY_COLORS };

// ═══ CONFLICT TIMELINE: Oct 2023 → Present ═══
// Casualty data verified from: Gaza MoH, Lancet Global Health, OCHA, UNICEF, IDF,
// Lebanese Health Ministry, Iran Health Ministry, HRANA, CENTCOM, Airwars, HRW.
// Casualty figures are INCREMENTAL per event — the cumulative function sums them.

export const conflictEvents: ConflictEvent[] = [
  // ══════════════════════════════════════════════
  // OCTOBER 7, 2023 — THE DAY THAT CHANGED EVERYTHING
  // ══════════════════════════════════════════════
  {
    id: 'oct7-rockets',
    date: '2023-10-07',
    time: '06:29',
    title: '6:29 AM — Hamas launches 2,200 rockets, breaches Gaza barrier',
    category: 'escalation',
    description: 'At 6:29 AM, Hamas fires 2,200+ rockets in 20 minutes across southern Israel. Simultaneously, hundreds of Nukhba commandos breach the Gaza-Israel barrier at 29 points using bulldozers, explosives, and paragliders. The largest attack on Israeli soil since 1973.',
    lat: 31.3853,
    lng: 34.4600,
    zoom: 16,
    sourceUrl: 'https://www.cbsnews.com/news/israel-hamas-war-timeline-major-events-since-october-7-2023/',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=_0atzea-mPY', label: 'Al Jazeera Investigation: October 7' }
    ]
  },
  {
    id: 'oct7-nova-festival',
    date: '2023-10-07',
    time: '06:32',
    title: 'Nova music festival massacre — 378 gunned down',
    category: 'escalation',
    description: '3,500 young people at an outdoor music festival near Re\'im. At 6:32 AM organizers tell everyone to leave. By 7 AM armed militants on motorcycles surround the site. Attendees run into open fields — hunted and shot. Bodies found in cars, in ditches, behind trees. 378 killed (344 civilians, 34 security). 44 taken hostage. The deadliest single-site massacre. First IDF unit arrives at 11:20 AM — nearly 5 hours after the attack began.',
    casualties: { killed: 378, source: 'Israeli Government (revised April 2025)' },
    lat: 31.3853,
    lng: 34.4600,
    zoom: 17,
    sourceUrl: 'https://en.wikipedia.org/wiki/Nova_music_festival_massacre',
    mediaUrls: [
      { type: 'news', url: 'https://www.jpost.com/israel-news/defense-news/article-848756', label: 'JPost: Nova massacre 378 killed' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=7sHxRcebDzM', label: 'BBC News: How the Nova Festival Attack Unfolded' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=zAr9oGSXgak', label: 'Screams Before Silence — sexual violence documentary' }
    ]
  },
  {
    id: 'oct7-beeri',
    date: '2023-10-07',
    time: '07:30',
    title: 'Kibbutz Be\'eri — 12-hour siege, families executed in homes',
    category: 'escalation',
    description: 'Militants enter Be\'eri at 6:50 AM. Residents barricade in safe rooms. Terrorists go house to house, executing families, burning homes with people inside. A 12-hour siege — IDF rescue takes until nightfall. 101 civilians and 31 security personnel killed. Entire families wiped out. Children murdered in their beds. 32 hostages dragged to Gaza.',
    casualties: { killed: 132, source: 'Israeli Government' },
    lat: 31.4238,
    lng: 34.4910,
    zoom: 17,
    sourceUrl: 'https://en.wikipedia.org/wiki/Be%27eri_massacre',
    mediaUrls: [
      { type: 'news', url: 'https://www.hrw.org/news/2024/07/17/october-7-crimes-against-humanity-war-crimes-hamas-led-groups', label: 'HRW: Crimes against humanity' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=ZBx7EJbtxkY', label: 'ABC News: Inside Kibbutz Be\'eri' }
    ]
  },
  {
    id: 'oct7-kfar-aza',
    date: '2023-10-07',
    time: '07:45',
    title: 'Kfar Aza — house-to-house killings, babies and elderly murdered',
    category: 'escalation',
    description: 'Hamas breaches Kfar Aza and goes door to door. Bodies found in homes and streets. Reports of sexual violence. Infants and elderly killed. At least 62 residents murdered. 19 kidnapped to Gaza. Among the first communities where journalists documented the aftermath — the images shocked the world.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=HAcIDUBP1dk', label: 'ABC News: Revisiting Kfar Aza Kibbutz After Hamas Attack' }
    ],
    casualties: { killed: 62, source: 'Israeli Government' },
    lat: 31.4835,
    lng: 34.5337,
    zoom: 17,
    sourceUrl: 'https://en.wikipedia.org/wiki/Kfar_Aza_massacre'
  },
  {
    id: 'oct7-nir-oz',
    date: '2023-10-07',
    time: '08:00',
    title: 'Nir Oz — 1 in 4 residents kidnapped, highest hostage ratio',
    category: 'escalation',
    description: 'Small kibbutz of 400 people near the border. 47 killed and 76 taken hostage — nearly 1 in 4 residents kidnapped. The highest ratio of any community. First IDF troops arrive 40 minutes AFTER the last terrorists left. Described as a "massive failure" of military response.',
    casualties: { killed: 47, source: 'Israeli Government' },
    lat: 31.3099,
    lng: 34.4011,
    zoom: 17,
    sourceUrl: 'https://en.wikipedia.org/wiki/Nir_Oz_attack',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=XNXgY3G55HU', label: 'CBS Mornings: Inside Nir Oz Kibbutz After Oct. 7 Attack' },
      { type: 'news', url: 'https://www.timesofisrael.com/massive-failure-first-troops-reached-kibbutz-nir-oz-40-minutes-after-last-terrorists-left', label: 'ToI: Massive failure at Nir Oz' }
    ]
  },
  {
    id: 'oct7-nahal-oz',
    date: '2023-10-07',
    time: '08:15',
    title: 'Nahal Oz military base overrun — female soldiers kidnapped',
    category: 'escalation',
    description: '215 Hamas fighters storm the IDF surveillance base 850m from Gaza. The unit monitoring Gaza — destroyed. 53 soldiers killed. 10 kidnapped including 7 young female observation soldiers who had warned of unusual Hamas activity in the days before. Toxic gas used to kill soldiers in protected positions.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=BB8uGxQ1MqQ', label: 'NBC News: Hamas Abducting Israeli Women at Nahal Oz' }
    ],
    casualties: { killed: 53, injured: 7, source: 'IDF' },
    lat: 31.4727,
    lng: 34.4977,
    zoom: 17,
    sourceUrl: 'https://www.timesofisrael.com/systemic-failure-how-nahal-oz-base-850-meters-from-gaza-yet-utterly-vulnerable-fell-to-hamas/'
  },
  {
    id: 'oct7-sderot',
    date: '2023-10-07',
    time: '09:00',
    title: 'Battle of Sderot — police station siege, city terrorized',
    category: 'escalation',
    description: '40 Nukhba fighters infiltrate Israel\'s largest border city. They attack the police station, killing the first officer at the entrance. Militants barricade inside. 53 killed: 37 civilians, 11 police, 2 firefighters. Last fighters not cleared until Oct 8. Station demolished with bulldozers.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=_45HVw5pEA8', label: 'Sky News: Many Killed in Sderot Following Attack' }
    ],
    casualties: { killed: 53, source: 'Israeli Government' },
    lat: 31.5265,
    lng: 34.5970,
    zoom: 16,
    sourceUrl: 'https://en.wikipedia.org/wiki/Battle_of_Sderot'
  },
  {
    id: 'oct7-other-communities',
    date: '2023-10-07',
    time: '12:00',
    title: '254 hostages taken to Gaza — families torn apart',
    category: 'escalation',
    description: 'Across 22+ communities: Kissufim (22 killed), Re\'im base attacked, Sufa, Nirim, Ein HaShlosha, Alumim. Total Oct 7: 1,139 killed (695+ civilians, 373 soldiers, 71 foreign workers). 3,400+ wounded. 254 people — including babies, children, elderly, Holocaust survivors — dragged into Gaza as hostages. The deadliest day for Jewish people since the Holocaust.',
    casualties: { killed: 414, injured: 3400, displaced: 200000, source: 'Israeli Government — remaining communities combined', children: 36 },
    lat: 31.40,
    lng: 34.45,
    zoom: 14,
    sourceUrl: 'https://www.bbc.com/news/world-middle-east-67039975',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=f1TdBUQirn0', label: 'CNN: Armed Terrorists Seen Parading Kidnapped Woman' },
      { type: 'news', url: 'https://www.aljazeera.com/news/2023/10/7/what-happened-in-israel-a-breakdown-of-how-the-hamas-attack-unfolded', label: 'Al Jazeera: How the attack unfolded' },
      { type: 'news', url: 'https://www.cnn.com/2023/11/15/middleeast/bodycam-video-hamas-massacre-tunnels-intl/index.html', label: 'CNN: Bodycam footage' }
    ],
    movements: [
      { type: 'displacement', from: [31.35, 34.40], to: [31.75, 34.78], label: '200K evacuated from border', volume: 200000 }
    ]
  },

  // ══════════════════════════════════════════════
  // OCT 7-27: IMMEDIATE AFTERMATH — BOTH SIDES
  // ══════════════════════════════════════════════
  {
    id: 'oct7-gaza-airstrikes-begin',
    date: '2023-10-07',
    time: '18:00',
    title: 'Israel retaliates — 2.3 million trapped as bombs begin falling',
    category: 'military_strike',
    description: 'Within hours of the Hamas attack, Israeli airstrikes begin hitting Gaza. By midnight, 230+ Palestinians killed including 37 children. Dense residential blocks hit. No bomb shelters in Gaza — no iron dome, no warning sirens, no safe rooms. 2.3 million people, 1 million of them children, sealed in a 25-mile strip with no way out. All border crossings closed.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=Yt7gzj8lenE', label: 'Sky News: Attack Prompts Intense Israeli Military Retaliation' }
    ],
    casualties: { killed: 230, injured: 1600, source: 'Gaza MoH (Oct 7 alone)', children: 37 },
    lat: 31.42,
    lng: 34.36,
    zoom: 10,
    sourceUrl: 'https://www.ochaopt.org/content/hostilities-in-the-gaza-strip-and-israel-flash-update-1'
  },
  {
    id: 'oct8-hezbollah-front',
    date: '2023-10-08',
    title: 'Hezbollah opens second front — attacks northern Israel',
    category: 'escalation',
    description: 'One day after Oct 7, Hezbollah fires rockets at Israeli positions in Shebaa Farms, declaring solidarity with Hamas. Israel responds with artillery. Start of continuous cross-border fire that will displace entire communities on both sides and eventually escalate into full Lebanon war.',
    lat: 33.28,
    lng: 35.70,
    zoom: 10,
    sourceUrl: 'https://en.wikipedia.org/wiki/October_2023_Israel%E2%80%93Hezbollah_fire_exchanges',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=WrOMJrsjT2k', label: 'France 24: Israel Strikes Lebanon After Hezbollah Hits Shebaa Farms' }
    ],
  },
  {
    id: 'oct8-hostage-crisis',
    date: '2023-10-08',
    title: 'Israel in shock — 254 hostages in Gaza tunnels, families beg for news',
    category: 'humanitarian',
    description: '254 people dragged into Gaza — babies as young as 9 months, Holocaust survivors in their 80s, entire families. Held underground in Hamas tunnels. No contact with families. Israeli society in collective trauma: 1,139 dead, thousands wounded, an entire generation of border communities wiped out. Parents waiting by phones that never ring.',
    lat: 31.77,
    lng: 35.21,
    zoom: 8,
    sourceUrl: 'https://www.bbc.com/news/world-middle-east-67053011',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=EDt5Jxr9pVw', label: 'ITV News: Families Plea for Lives of Children Kidnapped by Hamas' }
    ],
  },
  {
    id: 'oct9-total-siege',
    date: '2023-10-09',
    title: '"We are fighting human animals" — total siege of Gaza declared',
    category: 'humanitarian',
    description: 'Defense Minister Gallant orders a "complete siege" of Gaza: "No electricity, no food, no fuel, everything is closed. We are fighting human animals." Power cut by 90%. Hospitals lose electricity. Desalination plants shut down. 2.3 million people — half of them children — trapped with dwindling supplies. The siege will last months.',
    casualties: { killed: 700, injured: 2000, source: 'Gaza MoH (first 2 days of airstrikes)' },
    lat: 31.42,
    lng: 34.36,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/news/2023/10/9/israel-announces-total-blockade-on-gaza',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=T41doeVtuVo', label: 'France 24: Israel Orders Complete Gaza Siege' },
      { type: 'news', url: 'https://www.pbs.org/newshour/world/israeli-defense-minister-orders-complete-siege-on-gaza-after-hamas-surprise-attack', label: 'PBS: No power, food or fuel' }
    ]
  },
  {
    id: 'oct10-jabalia-camp',
    date: '2023-10-10',
    title: 'Jabalia refugee camp hit — 6,000 bombs in 6 days',
    category: 'military_strike',
    description: 'Israel drops 6,000 bombs on Gaza in the first 6 days — more than the US dropped on Afghanistan in an entire year. Jabalia, one of the most densely populated places on Earth, hit repeatedly. Entire city blocks flattened. Families pulled from rubble. By Oct 10: 900+ Palestinians killed including 260+ children. No way out, nowhere to hide.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=T-o5AiMKoL8', label: 'France 24: Dozens Killed in Strike on Jabalia Refugee Camp' }
    ],
    casualties: { killed: 200, injured: 600, source: 'Gaza MoH (incremental Oct 10)', children: 60 },
    lat: 31.53,
    lng: 34.50,
    zoom: 13,
    sourceUrl: 'https://www.bbc.com/news/world-middle-east-67062080'
  },
  {
    id: 'oct12-sexual-violence-evidence',
    date: '2023-10-12',
    title: 'Evidence of systematic sexual violence emerges from Oct 7 sites',
    category: 'humanitarian',
    description: 'ZAKA volunteers and forensic teams processing Oct 7 sites find evidence of widespread sexual violence. Bodies of women found with signs of assault. UN will later confirm "reasonable grounds" that sexual violence occurred at multiple sites including the Nova festival. First responders describe scenes they cannot unsee.',
    lat: 31.40,
    lng: 34.45,
    zoom: 11,
    sourceUrl: 'https://www.un.org/sexualviolenceinconflict/press-release/mission-report-of-the-office-of-the-srsg-svc-to-israel-and-the-occupied-west-bank/',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=fveD6Cpb9fo', label: 'France 24: Oct 7 Sexual Violence Investigation' }
    ],
  },
  {
    id: 'oct13-evacuation-order',
    date: '2023-10-13',
    title: '1.1 million ordered to evacuate northern Gaza in 24 hours',
    category: 'humanitarian',
    description: 'Israel orders ALL residents north of Wadi Gaza — 1.1 million people — to evacuate south in 24 hours. UN: "impossible" and "extremely dangerous." Hundreds of thousands flee on foot down a single road. Those who can\'t move — elderly, disabled, hospital patients — are left behind. Evacuation convoys bombed.',
    casualties: { killed: 1500, displaced: 1100000, source: 'Gaza MoH (through Oct 13)', children: 500 },
    lat: 31.45,
    lng: 34.42,
    zoom: 11,
    sourceUrl: 'https://www.pbs.org/newshour/world/israel-orders-evacuation-of-1-million-in-northern-gaza-in-24-hours',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=mUMiuDq4_vU', label: 'Al Jazeera: Fear and Confusion Over Gaza Evacuation' }
    ],
    movements: [
      { type: 'displacement', from: [31.52, 34.45], to: [31.35, 34.31], label: '1.1M ordered south', volume: 1100000 }
    ]
  },
  {
    id: 'oct17-al-ahli-hospital',
    date: '2023-10-17',
    title: 'Al-Ahli Hospital explosion — hundreds killed sheltering',
    category: 'military_strike',
    description: 'Explosion hits the courtyard of Al-Ahli Hospital where hundreds of displaced civilians were sleeping. Gaza MoH: 471 killed. US intelligence: 100-300. Cause disputed — Hamas blames Israeli airstrike, Israel blames PIJ rocket misfire. HRW cannot conclusively determine origin. Explosion triggers massive protests across Arab world.',
    casualties: { killed: 471, injured: 342, source: 'Gaza Health Ministry' },
    lat: 31.5049,
    lng: 34.4616,
    zoom: 15,
    sourceUrl: 'https://www.hrw.org/news/2023/11/26/gaza-findings-october-17-al-ahli-hospital-explosion',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=p47rtxtIPOE', label: 'Al Jazeera: World Reacts as 500 Killed in Hospital Strike' },
      { type: 'news', url: 'https://www.aljazeera.com/news/2023/10/18/what-do-we-know-about-the-strike-on-the-hospital-in-gaza', label: 'Al Jazeera: What we know' }
    ]
  },
  {
    id: 'oct15-hind-rajab',
    date: '2023-10-15',
    title: 'Children trapped in cars, under rubble — rescue impossible',
    category: 'humanitarian',
    description: 'Across Gaza, children are dying under rubble with no rescue equipment. Hospitals overwhelmed — operating without anesthesia. Doctors amputating limbs of children with no painkillers. Parents writing children\'s names on their legs so bodies can be identified. 724 children killed in the first 8 days.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=pyKIg-UkHEE', label: 'CNN: Palestinian Girl Trapped in Car Calls for Help' }
    ],
    casualties: { killed: 300, source: 'Gaza MoH (incremental Oct 14-15)', children: 150 },
    lat: 31.42,
    lng: 34.36,
    zoom: 10,
    sourceUrl: 'https://www.unicef.org/press-releases/hundreds-children-being-killed-and-injured-every-day-gaza-say-united-nations'
  },
  {
    id: 'oct21-rafah-aid',
    date: '2023-10-21',
    title: 'First aid enters Gaza — 20 trucks. Before the war: 100/day.',
    category: 'humanitarian',
    description: 'After two weeks of total siege, 20 aid trucks enter through Rafah — the first since Oct 7. Medicine and food only. No fuel. Before the war, Gaza received 100+ trucks daily. WHO: "a drop in the ocean." 2.3 million people have had almost no food, water, or medicine for 14 days.',
    lat: 31.2725,
    lng: 34.2586,
    zoom: 13,
    sourceUrl: 'https://www.aljazeera.com/news/2023/10/21/rafah-border-crossing-between-gaza-egypt-opens-for-aid-trucks',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=ASWxSfcllNw', label: 'Guardian News: Aid Trucks Enter Gaza After Rafah Crossing Opens' }
    ],
  },
  {
    id: 'oct27-ground-invasion',
    date: '2023-10-27',
    title: 'Israel launches ground invasion — 100,000 troops enter Gaza',
    category: 'escalation',
    description: 'After 20 days of aerial bombardment (6,000+ bombs in first week — more than the US dropped on Afghanistan in a year), IDF sends 100,000+ soldiers into northern Gaza. Communications cut — all phones and internet go dark. Beginning of ground campaign that will systematically destroy northern Gaza. By this point: 8,000+ Palestinians killed in 20 days of bombing.',
    casualties: { killed: 5000, injured: 15000, displaced: 400000, source: 'Gaza MoH (incremental Oct 14-27)', children: 2000 },
    lat: 31.54,
    lng: 34.48,
    zoom: 11,
    sourceUrl: 'https://en.wikipedia.org/wiki/2023_Israeli_invasion_of_the_Gaza_Strip',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=JrBgaPijH6Q', label: 'CBS News: Israeli Military Expanding Ground Operations in Gaza' },
      { type: 'news', url: 'https://www.pbs.org/newshour/world/israel-to-begin-long-ground-war-in-gaza-soon-aims-to-destroy-hamas-and-its-tunnels', label: 'PBS: Long ground war begins' }
    ],
    movements: [
      { type: 'military', from: [31.55, 34.55], to: [31.52, 34.45], label: '100K+ troops enter northern Gaza' },
      { type: 'displacement', from: [31.52, 34.45], to: [31.35, 34.31], label: 'More flee south', volume: 400000 }
    ]
  },

  // ══════════════════════════════════════════════
  // NOV 2023: JABALIA, HOSPITALS, CEASEFIRE
  // ══════════════════════════════════════════════
  {
    id: 'nov1-jabalia-second-bombing',
    date: '2023-11-01',
    title: 'Jabalia bombed for 2nd day — 30 buildings leveled in one quarter',
    category: 'military_strike',
    description: 'Israel bombs Jabalia refugee camp for the second consecutive day, leveling 30 residential buildings across an entire quarter. IDF claims it killed Hamas commander Ibrahim Biari. UN Human Rights Office warns the attacks could amount to war crimes given the scale of civilian casualties in one of the most densely populated areas on Earth.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=9L4MQY0Ge6s', label: 'ABC News: IDF Confirms 2nd Strike on Jabalia Refugee Camp' }
    ],
    casualties: { killed: 195, injured: 777, source: 'Gaza MoH / OHCHR' },
    lat: 31.5327,
    lng: 34.4982,
    zoom: 16,
    sourceUrl: 'https://www.aljazeera.com/news/2023/11/1/israel-bombs-jabalia-refugee-camp-for-second-day-palestinian-officials-say'
  },
  {
    id: 'nov3-ambulance-convoy',
    date: '2023-11-03',
    title: 'Airstrike hits ambulance convoy outside Al-Shifa Hospital',
    category: 'military_strike',
    description: 'Israeli airstrike hits ambulance convoy transporting critically wounded patients from Al-Shifa to Rafah crossing. Human Rights Watch calls it "apparently unlawful." Israel claims ambulance used by Hamas cell. 15 killed, 60 injured. Paramedics now targets.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=TRDun9dplUk', label: 'WION: Israel Strikes Ambulance at Al-Shifa Hospital' }
    ],
    casualties: { killed: 15, injured: 60, source: 'Gaza MoH / HRW' },
    lat: 31.5212,
    lng: 34.4399,
    zoom: 15,
    sourceUrl: 'https://www.aljazeera.com/news/2023/11/3/several-killled-in-israeli-attack-on-ambulance-convoy-gaza-health-ministry'
  },
  {
    id: 'nov5-gaza-split',
    date: '2023-11-05',
    title: 'IDF splits Gaza in two — encircles Gaza City',
    category: 'escalation',
    description: 'Israeli military completes encirclement of Gaza City, dividing the Strip into north and south. IDF spokesman: "Today, there is north Gaza and south Gaza." Third total communications blackout. Al-Maghazi refugee camp bombed the same day — 52 killed, mostly women and children.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=itFYO-ZKlFM', label: 'WSJ: Israel Says It Has Surrounded Gaza City' }
    ],
    casualties: { killed: 52, source: 'Al-Aqsa Martyrs Hospital / CNN' },
    lat: 31.4500,
    lng: 34.4000,
    zoom: 12,
    sourceUrl: 'https://www.aljazeera.com/news/2023/11/5/israels-military-claims-it-has-cut-gaza-in-half-surrounded-gaza-city'
  },
  {
    id: 'nov11-al-shifa-encircled',
    date: '2023-11-11',
    title: 'Al-Shifa encircled — premature babies dying without incubators',
    category: 'humanitarian',
    description: 'Israeli forces complete encirclement of Al-Shifa Hospital, trapping 1,500 patients, 1,500 medical workers, and 15,000 displaced people. Hospital loses all electricity. 37 premature babies left without incubators. 3 babies and 2 ICU patients die within hours. Snipers fire at anyone near windows. Newborns wrapped in foil, placed near hot water to survive.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=-ZFzpsB1dOQ', label: 'Al Jazeera: Premature Babies Die at Al-Shifa Hospital' }
    ],
    casualties: { killed: 37, source: 'WHO / Gaza MoH (patients who died during siege)' },
    lat: 31.5212,
    lng: 34.4399,
    zoom: 16,
    sourceUrl: 'https://www.aljazeera.com/news/2023/11/11/we-are-minutes-away-from-death-gazas-al-shifa-hospital-under-attack'
  },
  {
    id: 'nov15-al-shifa',
    date: '2023-11-15',
    title: 'IDF storms Al-Shifa Hospital — "command center" raid',
    category: 'military_strike',
    description: 'IDF raids Gaza\'s largest hospital claiming Hamas command center beneath. 300+ patients trapped. WHO loses contact. 21+ patients die during siege. Nov 19: 31 premature babies evacuated — some already dead. Hospital rendered non-functional. Bodies of 2 hostages found nearby. IDF shows tunnel shaft and weapons — critics say evidence falls far short of "command center" claim.',
    casualties: { killed: 2500, source: 'Gaza MoH (incremental Nov 1-15 remainder)' },
    lat: 31.5212,
    lng: 34.4399,
    zoom: 16,
    sourceUrl: 'https://www.bbc.com/news/world-middle-east-67423077',
    mediaUrls: [
      { type: 'news', url: 'https://www.npr.org/2024/04/06/1243045199/al-shifa-hospital-gaza-israel-raid-before-aftermath', label: 'NPR: Before and after the raid' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=8J_Qf6hpWmg', label: 'Channel 4: Israeli Forces Raid Gaza\'s Largest Hospital' }
    ]
  },
  {
    id: 'nov20-indonesian-hospital',
    date: '2023-11-20',
    title: 'Indonesian Hospital besieged — shelled for the 5th time',
    category: 'military_strike',
    description: 'IDF completely surrounds Indonesian Hospital in Beit Lahia. Shell strikes second floor, killing 12 patients. Main operating room destroyed. Tanks surround facility. Al-Awda Hospital struck next day — 3 doctors killed. Northern Gaza now has zero functioning hospitals.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=myeXJa7ci88', label: 'Al Jazeera: Israeli Tanks Besiege Indonesian Hospital' }
    ],
    casualties: { killed: 16, source: 'Gaza MoH' },
    lat: 31.5352,
    lng: 34.5094,
    zoom: 16,
    sourceUrl: 'https://www.aljazeera.com/news/2023/11/20/israel-targets-gazas-indonesian-hospital-here-is-whats-to-know'
  },
  {
    id: 'nov24-ceasefire-hostages',
    date: '2023-11-24',
    title: 'First ceasefire — 105 hostages freed in 7-day deal',
    category: 'diplomatic',
    description: 'Qatar-brokered deal: 50 Israeli hostages for 150 Palestinian prisoners, extended to 7 days. 105 hostages released (81 Israeli, 23 Thai, 1 Filipino). 240 Palestinian prisoners freed. Emotional reunions — hostages describe dark tunnels, minimal food, psychological terror. Aid surges into Gaza. First sustained break since Oct 7. By now: 14,000+ Palestinians killed.',
    casualties: { killed: 2700, source: 'Gaza MoH (incremental Nov 16-24)' },
    lat: 31.42,
    lng: 34.36,
    zoom: 10,
    sourceUrl: 'https://en.wikipedia.org/wiki/2023_Gaza_war_ceasefire',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=fi7f3iWZVvM', label: 'Al Jazeera: Gaza Truce Deal — First Halt in Seven Weeks' },
      { type: 'news', url: 'https://www.aljazeera.com/news/2023/11/22/behind-the-scenes-how-did-the-israel-hamas-truce-deal-unfold', label: 'Al Jazeera: Behind the deal' }
    ]
  },
  {
    id: 'nov-hostage-testimonies',
    date: '2023-11-28',
    title: 'Freed hostages describe captivity — darkness, terror, starvation',
    category: 'humanitarian',
    description: 'Released hostages describe conditions: held underground in tunnels with no light for weeks. Minimal food — one pita bread shared between 10 people. Children separated from parents. Elderly denied medication. Psychological torture. Some moved repeatedly under bombardment. A 9-month-old baby held for 50 days. The trauma will last lifetimes.',
    lat: 31.35,
    lng: 34.35,
    zoom: 10,
    sourceUrl: 'https://www.bbc.com/news/world-middle-east-67542435',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=GxI_C5S6dvw', label: 'Al Jazeera: Freed Israeli Captive Talks About Abduction' }
    ],
  },

  // ══════════════════════════════════════════════
  // DEC 2023: CEASEFIRE COLLAPSE, KHAN YOUNIS, ICJ
  // ══════════════════════════════════════════════
  {
    id: 'dec1-ceasefire-collapses',
    date: '2023-12-01',
    title: 'Ceasefire collapses — 200 airstrikes resume, Khan Younis invaded',
    category: 'escalation',
    description: 'Ceasefire collapses after negotiations fail. Israel launches 200+ airstrikes in hours. 178 killed on first day alone. IDF simultaneously pushes into Khan Younis, southern Gaza\'s largest city. Now orders ALL of southern Gaza to evacuate too — 1.9M of 2.1M Gazans displaced. There is nowhere left to go.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=AO7GEFkS6s0', label: 'CBS News: IDF Airstrikes Resume After Ceasefire Collapse' }
    ],
    casualties: { killed: 1000, displaced: 400000, source: 'Gaza MoH (Dec 1 week)' },
    lat: 31.34,
    lng: 34.31,
    zoom: 11,
    sourceUrl: 'https://www.npr.org/2023/12/01/1216333362/israel-hamas-ceasefire-combat-gaza-hostages',
    movements: [
      { type: 'military', from: [31.45, 34.40], to: [31.34, 34.31], label: 'IDF pushes into Khan Younis' },
      { type: 'displacement', from: [31.34, 34.31], to: [31.24, 34.24], label: '400K flee toward Rafah', volume: 400000 }
    ]
  },
  {
    id: 'dec6-article-99',
    date: '2023-12-06',
    title: 'UN chief invokes Article 99 — only 6th time in history',
    category: 'diplomatic',
    description: 'Secretary-General Guterres invokes Article 99 of the UN Charter for the first time since 2017, formally bringing the crisis to the Security Council. Used only 6 times in UN history. Warns situation is "fast deteriorating into a catastrophe with potentially irreversible implications." Two days later, the US vetoes a ceasefire resolution backed by 97 nations.',
    lat: 40.7489,
    lng: -73.9680,
    zoom: 5,
    sourceUrl: 'https://news.un.org/en/story/2023/12/1144447',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=fHHPepOmOb4', label: 'Al Jazeera: UN Chief Invokes Article 99 on Gaza' }
    ],
  },
  {
    id: 'dec7-refaat-alareer',
    date: '2023-12-07',
    title: 'Poet Refaat Alareer killed — "If I Must Die" goes viral',
    category: 'military_strike',
    description: 'Palestinian poet and professor Refaat Alareer (44) killed in airstrike in Shejaiya with his brother, sister, and four nephews. Euro-Med Monitor says he was deliberately targeted — "surgically bombed out of the entire building" after weeks of death threats. His poem "If I Must Die" will be translated into 250+ languages and read at protests worldwide.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=3YwwZhvCw2M', label: 'Al Jazeera: Remembering Palestinian Poet Refaat Alareer' }
    ],
    casualties: { killed: 7, source: 'Euro-Med Monitor' },
    lat: 31.5100,
    lng: 34.4600,
    zoom: 15,
    sourceUrl: 'https://www.aljazeera.com/news/2023/12/8/palestinian-people-mourn-the-death-of-refaat-alareer'
  },
  {
    id: 'dec8-mosque-detention',
    date: '2023-12-08',
    title: '7th-century Great Omari Mosque destroyed — mass detention photos',
    category: 'military_strike',
    description: 'Gaza\'s 7th-century Great Omari Mosque reduced to rubble — only its minaret remains. Same day, photos emerge of Palestinian men detained in Beit Lahia: stripped to underwear, hands tied, blindfolded in rows. Senior IDF officers later admit to Haaretz that "85-90%" of detainees were not Hamas.',
    lat: 31.5030,
    lng: 34.4560,
    zoom: 16,
    sourceUrl: 'https://www.cnn.com/2023/12/07/middleeast/gaza-israeli-soldiers-detained-men-intl/index.html',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=sxTGr8giBtg', label: 'Al Jazeera: Great Omari Mosque Hit in Israeli Airstrike' }
    ],
  },
  {
    id: 'dec12-un-ga-ceasefire',
    date: '2023-12-12',
    title: 'UN General Assembly votes 153-10 demanding ceasefire',
    category: 'diplomatic',
    description: 'UN General Assembly demands immediate humanitarian ceasefire — 153 nations in favor, only 10 against (US, Israel, and 8 others). Non-binding but politically devastating. Same day: Kamal Adwan Hospital raided, director and 70+ staff arrested. IDF begins flooding Hamas tunnels with seawater.',
    lat: 40.7489,
    lng: -73.9680,
    zoom: 5,
    sourceUrl: 'https://www.npr.org/2023/12/12/1218927939/un-general-assembly-gaza-israel-resolution-cease-fire-us',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=tlIQW6Cn5kk', label: 'BBC News: UN General Assembly Demands Immediate Gaza Ceasefire' }
    ],
  },
  {
    id: 'dec15-hostages-white-flag',
    date: '2023-12-15',
    title: 'IDF kills 3 Israeli hostages waving white flag',
    category: 'humanitarian',
    description: 'Three Israeli hostages — Yotam Haim (28), Alon Shamriz (26), Samer Talalka (24) — shot dead by IDF in Shejaiya despite being shirtless, unarmed, waving a white flag. Sniper kills two; third shot 15 minutes later against battalion commander\'s direct order to hold fire. IDF chief admits it violated rules of engagement. Same day: Al Jazeera cameraman Samer Abudaqa killed — left to bleed out for hours as IDF blocks paramedics.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=byVenkiDm_o', label: 'CBC News: 3 Israeli Hostages Holding White Flag Killed by IDF' }
    ],
    casualties: { killed: 4, source: 'IDF / Al Jazeera (3 hostages + 1 journalist)' },
    lat: 31.5150,
    lng: 34.4650,
    zoom: 15,
    sourceUrl: 'https://www.npr.org/2023/12/15/1219695220/israel-soldiers-mistakenly-kill-hostages-gaza'
  },
  {
    id: 'dec21-famine-warning',
    date: '2023-12-21',
    title: '93% of Gaza population facing hunger crisis — famine imminent',
    category: 'humanitarian',
    description: 'Report by 23 UN and NGOs: entire Gaza population in food crisis. 576,600 at starvation level. 93% (2.08M people) at crisis-level hunger or worse. WHO: 2.2 million "at imminent risk of famine." Aid entering is 10% of what\'s needed. Children beginning to die of malnutrition. The siege is working.',
    lat: 31.42,
    lng: 34.36,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/news/2023/12/21/entire-gaza-population-facing-hunger-crisis-famine-risk-un-backed-report',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=CjMV_xhqsrM', label: 'Al Jazeera: Worsening Food and Water Shortages in Gaza' }
    ],
  },
  {
    id: 'dec24-christmas-massacre',
    date: '2023-12-24',
    title: 'Christmas Eve massacre — 250 killed across Gaza in 24 hours',
    category: 'military_strike',
    description: 'Israeli warplanes strike three houses in al-Maghazi refugee camp: 106 killed. Gaza MoH: "massacre on a crowded residential square." 250+ Palestinians killed across Gaza in 24 hours — additional mass casualties in Khan Younis, Bureij, Nuseirat. MSF: 209 injured and 131 dead at Al-Aqsa Hospital from Christmas Eve strikes alone.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=PC6mg0R5fSY', label: 'CNN: At Least 250 Killed in Gaza in 24 Hours' }
    ],
    casualties: { killed: 250, injured: 209, source: 'AP / MSF / Gaza MoH' },
    lat: 31.4223,
    lng: 34.3850,
    zoom: 15,
    sourceUrl: 'https://www.aljazeera.com/news/2023/12/25/israel-intensifies-gaza-strikes-killing-250-palestinians-in-24-hours'
  },
  {
    id: 'dec29-south-africa-icj',
    date: '2023-12-29',
    title: 'South Africa files genocide case at the ICJ',
    category: 'diplomatic',
    description: 'South Africa files application at International Court of Justice accusing Israel of violating the Genocide Convention. Cites killing, serious harm, and "conditions calculated to bring about physical destruction." Hearings set for Jan 11-12. The most consequential international legal action of the conflict. By Dec 31: 21,600+ Palestinians killed, 1.9M displaced, 65,000 homes destroyed.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=Y0zI9BDnCyI', label: 'Al Jazeera: South Africa Files Genocide Case at ICJ' }
    ],
    casualties: { killed: 1500, source: 'Gaza MoH (incremental Dec 8-31)' },
    lat: 52.0862,
    lng: 4.3138,
    zoom: 8,
    sourceUrl: 'https://www.icj-cij.org/case/192'
  },

  // ══════════════════════════════════════════════
  // 2024 Q1: FAMINE, FLOUR MASSACRE, HOUTHI WAR
  // ══════════════════════════════════════════════
  {
    id: 'arouri-assassinated',
    date: '2024-01-02',
    title: 'Hamas deputy leader assassinated in Beirut',
    category: 'escalation',
    description: 'Israeli drone strike kills Saleh al-Arouri, deputy leader of Hamas and co-founder of its military wing, in Dahieh, Beirut. 6 other Hamas members killed. Most senior Hamas leader killed since Oct 7. Raises fears of full Lebanon war.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=Ny-jltcXFdM', label: 'France 24: Hamas Leader Killed in Beirut Strike' }
    ],
    casualties: { killed: 7, source: 'Hamas / Lebanese security' },
    lat: 33.85,
    lng: 35.48,
    zoom: 14,
    sourceUrl: 'https://www.aljazeera.com/news/2024/1/2/top-hamas-official-saleh-al-arouri-killed-in-beirut-suburb'
  },
  {
    id: 'houthi-shipping-attacks',
    date: '2024-01-12',
    title: 'US/UK strike Houthi targets — Red Sea shipping in crisis',
    category: 'chokepoint',
    description: 'Houthis attacking commercial shipping since Nov 2023 in solidarity with Gaza. US/UK launch strikes on Yemen. Bab el-Mandeb disrupted — shipping reroutes around Africa adding 10+ days. Global trade impact: $100B+ in rerouting costs.',
    casualties: { killed: 106, injured: 314, source: 'Houthi figures / CENTCOM (through Jan 2025)' },
    facilityId: 'bab-el-mandeb',
    lat: 12.58,
    lng: 43.33,
    zoom: 7,
    sourceUrl: 'https://www.reuters.com/world/middle-east/us-launches-strikes-against-houthi-targets-yemen-officials-say-2024-01-12/',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=f9rEjpAPQyo', label: 'Al Jazeera: US and UK Strike Yemen Houthis' },
      { type: 'news', url: 'https://www.crisisgroup.org/visual-explainers/red-sea/', label: 'Crisis Group: Red Sea visual' }
    ],
    movements: [
      { type: 'supply_disruption', from: [12.58, 43.33], to: [-34.35, 18.47], label: 'Shipping rerouted around Africa', volume: 6200000 }
    ]
  },
  {
    id: 'idf-deadliest-day',
    date: '2024-01-22',
    title: '24 IDF soldiers killed — deadliest day of ground invasion',
    category: 'military_strike',
    description: '21 reservists die when 2 buildings collapse from RPG hit detonating planted explosives near the border. 3 more killed elsewhere. Deadliest single day for IDF since the ground invasion began. Simultaneously, IDF announces encirclement of Khan Younis — Sinwar\'s hometown.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=YZ0W2P2SaZQ', label: 'Al Jazeera: Deadliest Day for Israeli Military in Gaza' }
    ],
    casualties: { killed: 24, source: 'IDF' },
    lat: 31.35,
    lng: 34.31,
    zoom: 12,
    sourceUrl: 'https://www.cnn.com/2024/01/23/middleeast/gaza-israeli-soldiers-deaths-intl-hnk/index.html'
  },
  {
    id: 'icj-genocide-ruling',
    date: '2024-01-26',
    title: 'ICJ orders Israel to prevent genocide in Gaza',
    category: 'diplomatic',
    description: 'International Court of Justice rules South Africa\'s genocide case is plausible. Orders Israel to prevent genocide, ensure humanitarian aid, preserve evidence. Israel rejects ruling. Same week: UNRWA funding suspended by 16 countries over Oct 7 allegations against 12 staff.',
    lat: 52.08,
    lng: 4.27,
    zoom: 8,
    sourceUrl: 'https://www.icj-cij.org/case/192',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=I3cPAueZ-4M', label: 'NBC News: ICJ Orders Israel to Prevent Genocide in Gaza' }
    ],
  },
  {
    id: 'jan29-hind-rajab',
    date: '2024-01-29',
    title: 'Hind Rajab, age 6 — calls for help for hours before being killed',
    category: 'humanitarian',
    description: '6-year-old Hind Rajab calls Palestinian Red Crescent from a car surrounded by dead relatives. She whispers in terror for 3 hours. "I\'m scared. Come take me." An ambulance is dispatched — both paramedics are killed. 12 days later her body is found in the car, riddled with bullets. She becomes a symbol of the war.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=HI71m_cQnbM', label: 'CBC News: 6-Year-Old Hind Rajab Found Dead in Gaza' }
    ],
    casualties: { killed: 2, source: 'PRCS (2 paramedics killed en route)' },
    lat: 31.50,
    lng: 34.44,
    zoom: 14,
    sourceUrl: 'https://www.bbc.com/news/world-middle-east-68210583'
  },
  {
    id: 'flour-massacre',
    date: '2024-02-29',
    title: 'Flour Massacre — 118 killed waiting for food aid',
    category: 'military_strike',
    description: 'At 4:30 AM, Israeli tanks and snipers open fire on thousands of Palestinians waiting for aid trucks at al-Nabulsi roundabout, Gaza City. Shooting continues for 90 minutes. 118 killed, 760+ injured — deadliest single mass casualty event since the invasion began. UN investigators find "large number of gunshot wounds." BBC Verify shows Israel\'s drone footage was edited.',
    casualties: { killed: 118, injured: 760, source: 'Gaza Health Ministry / UN investigation' },
    lat: 31.53,
    lng: 34.44,
    zoom: 14,
    sourceUrl: 'https://www.aljazeera.com/news/2024/2/29/dozens-killed-injured-by-israeli-fire-in-gaza-while-collecting-food-aid',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=ywOzeZl7uIU', label: 'CNN: 104 Civilians Killed Trying to Access Food Aid' },
      { type: 'news', url: 'https://www.cnn.com/2024/02/29/middleeast/gaza-city-deaths-food-israel-intl/index.html', label: 'CNN: Flour Massacre investigation' }
    ]
  },
  {
    id: 'gaza-famine-ipc',
    date: '2024-03-18',
    title: 'Famine imminent in northern Gaza — children dying of starvation',
    category: 'humanitarian',
    description: 'IPC confirms famine imminent. 31% of children under 2 in northern Gaza acutely malnourished. 23 children dead from starvation. 1.11 million (half of Gaza) projected to face catastrophic hunger. Same day: IDF launches 2nd siege on Al-Shifa Hospital — 14 days, 409 bodies found after withdrawal, hospital left "completely destroyed."',
    casualties: { killed: 8000, injured: 20000, source: 'Gaza MoH (incremental Jan-Mar 2024)', children: 4000 },
    lat: 31.55,
    lng: 34.50,
    zoom: 10,
    sourceUrl: 'https://www.ipcinfo.org/ipcinfo-website/alerts-archive/issue-97/en/',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=vX9yDTsvOH8', label: 'France 24: Famine Imminent in Northern Gaza' },
      { type: 'news', url: 'https://www.aljazeera.com/news/longform/2024/3/15/mapping-the-destruction-of-gazas-health-system', label: 'Al Jazeera: Gaza\'s destroyed health system' }
    ]
  },
  // ══════════════════════════════════════════════
  // 2024 Q2: IRAN ATTACKS, RAFAH INVASION, NUSEIRAT
  // ══════════════════════════════════════════════
  {
    id: 'damascus-consulate-strike',
    date: '2024-04-01',
    title: 'Israel destroys Iranian consulate in Damascus — 16 killed',
    category: 'escalation',
    description: 'Israeli F-35s fire 6 missiles at Iran\'s embassy compound in Damascus. Brigadier General Zahedi (most senior IRGC officer killed since Soleimani), his deputy, and 6 other Quds Force officers among 16 dead. Iran vows retaliation. This strike directly triggers Iran\'s April 13 attack.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=6ldUzS2GYms', label: 'Al Jazeera: Israeli Strike on Iranian Consulate in Damascus' }
    ],
    casualties: { killed: 16, source: 'Iranian state media / IRGC' },
    lat: 33.51,
    lng: 36.28,
    zoom: 14,
    sourceUrl: 'https://www.aljazeera.com/news/2024/4/1/several-killed-in-israeli-strike-on-iranian-consulate-in-damascus-reports'
  },
  {
    id: 'wck-aid-workers-killed',
    date: '2024-04-01',
    title: 'Israel kills 7 World Central Kitchen aid workers — triple drone strike',
    category: 'military_strike',
    description: 'Israeli drones strike a WCK convoy three separate times, killing all 7 aid workers in 3 clearly marked vehicles after delivering 100 tons of food. Victims from Australia, Poland, UK, US-Canada, Palestine. Route was coordinated with IDF. Multiple aid orgs suspend Gaza operations.',
    casualties: { killed: 7, source: 'WCK / IDF investigation' },
    lat: 31.42,
    lng: 34.35,
    zoom: 14,
    sourceUrl: 'https://www.cnn.com/2024/04/01/middleeast/world-central-kitchen-killed-gaza-intl-hnk/index.html',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=jTS5nbjMW2Y', label: 'AP: Israeli Strike Kills 7 World Central Kitchen Workers' },
      { type: 'news', url: 'https://www.npr.org/2024/04/01/1242177519/world-central-kitchen-workers-deaths-gaza', label: 'NPR: WCK workers killed' }
    ]
  },
  {
    id: 'iran-israel-april-drones',
    date: '2024-04-13',
    title: 'Iran launches 300+ drones and missiles at Israel',
    category: 'retaliation',
    description: 'Iran\'s first direct attack on Israel — retaliation for Damascus consulate strike. 170 drones, 30 cruise missiles, 120 ballistic missiles. Nearly all intercepted by Israel, US, UK, Jordan, Saudi. Historic threshold crossed — direct state-to-state combat.',
    lat: 31.77,
    lng: 35.21,
    zoom: 7,
    sourceUrl: 'https://www.nytimes.com/2024/04/13/world/middleeast/iran-attacks-israel.html',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=fILEjXQHOps', label: 'Al Jazeera: Iran Attacks Israel — Majority of Drones Intercepted' },
      { type: 'news', url: 'https://www.aljazeera.com/news/2024/4/14/iran-attacks-israel-with-over-300-drones-missiles-what-you-need-to-know', label: 'Al Jazeera: 300+ drones explainer' },
      { type: 'news', url: 'https://www.bbc.com/news/world-middle-east-68808933', label: 'BBC: Iran attack explained' }
    ]
  },
  {
    id: 'israel-strikes-isfahan',
    date: '2024-04-19',
    title: 'Israel strikes Isfahan — near Iranian nuclear facilities',
    category: 'military_strike',
    description: 'Israel retaliates with limited strike near Isfahan nuclear complex. Calculated to demonstrate reach without triggering full war. Iran downplays damage.',
    lat: 32.65,
    lng: 51.68,
    zoom: 8,
    sourceUrl: 'https://www.bbc.com/news/world-middle-east-68852804',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=XZZSCxCg_q0', label: 'Al Jazeera: Drone Attack on Iran Near Isfahan' }
    ],
  },
  {
    id: 'nasser-mass-graves',
    date: '2024-04-21',
    title: 'Mass graves at Al-Shifa and Nasser hospitals — 700+ bodies',
    category: 'humanitarian',
    description: 'After IDF withdraws from both hospitals, 381 bodies found at Al-Shifa and 300+ at Nasser. Some with hands tied, stripped of clothes — women, children, elderly. Israel says it "examined previously buried bodies looking for hostages." UN calls it "deeply disturbing."',
    lat: 31.34,
    lng: 34.31,
    zoom: 12,
    sourceUrl: 'https://www.aljazeera.com/news/2024/4/21/nearly-200-bodies-found-in-mass-grave-at-hospital-in-gazas-khan-younis',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=OcZ4_dZ8WZU', label: 'BBC News: UN Demands Investigation of Mass Graves at Gaza Hospitals' }
    ],
  },
  {
    id: 'rafah-invasion',
    date: '2024-05-06',
    title: 'Israel invades Rafah — last refuge for 1.4M displaced',
    category: 'escalation',
    description: 'IDF launches ground operation in Rafah. 1.4M displaced sheltering there — the "last safe zone." 600K flee in 3 days. Rafah crossing seized, aid halted. May 8: Biden pauses 2,000-lb bomb shipment. May 24: ICJ orders Israel to "immediately halt" Rafah offensive. Israel ignores both.',
    casualties: { killed: 3000, displaced: 600000, source: 'Gaza MoH (Rafah operation May-Jun)', children: 800 },
    lat: 31.24,
    lng: 34.245,
    zoom: 12,
    sourceUrl: 'https://www.reuters.com/world/middle-east/israel-tells-eastern-rafah-residents-evacuate-2024-05-06/',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=aHnIyNFat-c', label: 'BBC News: Deadly Israeli Strikes on Rafah' },
      { type: 'news', url: 'https://www.aljazeera.com/news/2024/5/24/icj-orders-israel-to-halt-its-offensive-on-rafah-gaza-in-new-ruling', label: 'Al Jazeera: ICJ orders Rafah halt' }
    ],
    movements: [
      { type: 'displacement', from: [31.24, 34.24], to: [31.33, 34.30], label: '600K flee Rafah', volume: 600000 }
    ]
  },
  {
    id: 'tel-al-sultan-massacre',
    date: '2024-05-26',
    title: 'Tent camp bombed 2 days after ICJ ordered Rafah halt — 50 killed',
    category: 'military_strike',
    description: 'IAF bombs displacement camp in Tel al-Sultan, Rafah — an area Israel designated as a "safe zone" one week prior. 7 900kg bombs dropped. Tents catch fire. 45-50 killed (12 women, 8 children, 3 elderly), 200+ injured. EU foreign policy chief: "a bloodbath." Came just 2 days after ICJ ordered Israel to halt the Rafah offensive.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=CdoL-PHVExo', label: 'France 24: Global Outrage After Israeli Strike on Rafah Camp' }
    ],
    casualties: { killed: 50, injured: 200, source: 'Gaza Health Ministry / UN', children: 8 },
    lat: 31.31,
    lng: 34.23,
    zoom: 14,
    sourceUrl: 'https://www.aljazeera.com/news/2024/5/27/heinous-massacre-israels-attacks-on-rafah-tent-camp-widely-condemned'
  },
  {
    id: 'nuseirat-rescue-massacre',
    date: '2024-06-08',
    title: 'Nuseirat hostage rescue — 4 freed, 274 Palestinians killed',
    category: 'military_strike',
    description: 'Israeli special forces disguised in aid truck raid 2 buildings in Nuseirat, rescuing 4 hostages (including Noa Argamani). Massive simultaneous bombardment of the refugee camp kills 274 Palestinians (64 children, 57 women), injures 698+. 1 IDF officer killed. The cost: 68 Palestinian lives per hostage rescued.',
    casualties: { killed: 274, injured: 698, source: 'Gaza Health Ministry / OHCHR', children: 64 },
    lat: 31.44,
    lng: 34.39,
    zoom: 14,
    sourceUrl: 'https://www.npr.org/2024/06/08/nx-s1-4997026/israel-gaza-hostages-rescued',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=0yHneWubuXg', label: 'Al Jazeera World: An Israeli Raid That Turned Into a Massacre' },
      { type: 'news', url: 'https://www.cnn.com/2024/06/09/middleeast/israel-hostage-rescue-gaza-intl-hnk/index.html', label: 'CNN: Hostage rescue and destruction' }
    ]
  },
  {
    id: 'al-mawasi-strike',
    date: '2024-07-13',
    title: 'Israel strikes "safe zone" tent camp — 90+ killed, Hamas commander targeted',
    category: 'military_strike',
    description: 'Airstrike hits tent camp in Al-Mawasi — an area Israel designated as a humanitarian safe zone. 90+ killed, 300+ wounded. Victims were displaced families sleeping in tents. IDF says it targeted Hamas military chief Mohammed Deif (confirmed killed Aug 1). The concept of "safe zones" is dead.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=7jlNiPSQCI8', label: 'France 24: Israeli Strike on Khan Younis Kills 90+' }
    ],
    casualties: { killed: 90, injured: 300, source: 'Gaza MoH' },
    lat: 31.30,
    lng: 34.24,
    zoom: 14,
    sourceUrl: 'https://www.bbc.com/news/articles/c3gge3n91pko'
  },
  {
    id: 'icj-occupation-unlawful',
    date: '2024-07-19',
    title: 'ICJ: Israel\'s occupation unlawful — must end, dismantle settlements',
    category: 'diplomatic',
    description: 'International Court of Justice issues landmark 11-4 advisory opinion declaring Israel\'s occupation of Gaza, West Bank, and East Jerusalem unlawful. Orders Israel to end occupation, dismantle all settlements, provide reparations. Says Israeli legislation violates prohibitions on racial segregation and apartheid. Most sweeping international legal ruling against Israel in history.',
    lat: 52.07,
    lng: 4.29,
    zoom: 5,
    sourceUrl: 'https://www.amnesty.org/en/latest/news/2024/07/icj-opinion-declaring-israels-occupation-of-palestinian-territories-unlawful-is-historic-vindication-of-palestinians-rights/',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=V-3vkHXNRDI', label: 'UN: ICJ Rules Israel Occupation Unlawful' }
    ],
  },
  {
    id: 'houthi-tel-aviv-drone',
    date: '2024-07-19',
    title: 'Houthi drone strikes Tel Aviv — evades all air defenses',
    category: 'escalation',
    description: 'A Houthi "Jaffa" drone (modified Iranian Samad-3) evades Israeli air defenses due to reported human error and strikes an apartment building near the US Embassy on Ben Yehuda Street, Tel Aviv. 1 killed, 10 injured. First successful Houthi attack to reach Tel Aviv. The war is reaching Israel\'s heartland from 2,000 km away.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=P8GY65VC16A', label: 'AP: Tel Aviv After Deadly Houthi Drone Strike' }
    ],
    casualties: { killed: 1, injured: 10, source: 'IDF / Magen David Adom' },
    lat: 32.09,
    lng: 34.78,
    zoom: 14,
    sourceUrl: 'https://www.aljazeera.com/news/2024/7/19/houthi-drone-strikes-tel-aviv-how-significant-is-the-attack'
  },
  {
    id: 'israel-strikes-hodeidah',
    date: '2024-07-20',
    title: 'Israel bombs Yemen\'s Hodeidah port — 1,800 km away',
    category: 'retaliation',
    description: 'In retaliation for the Tel Aviv drone, the Israeli Air Force strikes Hodeidah port: 24+ oil storage tanks, 2 shipping cranes, a power plant. First direct Israeli strike on Houthi territory, 1,800 km from Israel\'s borders. 3 killed, 87 wounded with severe burns.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=boTnMDUTp7Q', label: 'Sky News: Israel Strikes Yemen Port After Houthi Attacks' }
    ],
    casualties: { killed: 3, injured: 87, source: 'Yemen Ministry of Health' },
    lat: 14.80,
    lng: 42.95,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/news/2024/7/20/air-raids-hit-yemens'
  },
  {
    id: 'majdal-shams-children',
    date: '2024-07-27',
    title: '12 Druze children killed by rocket during football match',
    category: 'escalation',
    description: 'A rocket strikes a football pitch in Majdal Shams, Israeli-occupied Golan Heights, during a children\'s football match. 12 Druze children aged 10-16 killed, 42 injured. Israel blames Hezbollah\'s Iranian-made Falaq-1 rocket; Hezbollah denies responsibility. Deadliest single Hezbollah-attributed attack since Oct 7.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=abru8hRvMvA', label: 'BBC News: 11 Young People Killed by Rocket in Golan Heights' }
    ],
    casualties: { killed: 12, injured: 42, source: 'IDF / Magen David Adom', children: 12 },
    lat: 33.27,
    lng: 35.77,
    zoom: 14,
    sourceUrl: 'https://www.aljazeera.com/news/2024/7/27/israel-says-10-killed-in-rocket-attack-on-occupied-golan-heights'
  },
  {
    id: 'shukr-killed-beirut',
    date: '2024-07-30',
    title: 'Israel kills Hezbollah\'s top military commander in Beirut strike',
    category: 'military_strike',
    description: 'Israeli airstrike levels a building in Dahieh, Beirut, killing Fuad Shukr — Nasrallah\'s right-hand man and Hezbollah\'s most senior military commander. 5 civilians (including 2 children) and an Iranian adviser also killed, 80 wounded.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=aSDSfkuRp2A', label: 'Al Jazeera: Hezbollah Commander Shukr Killed in Beirut Strike' }
    ],
    casualties: { killed: 7, injured: 80, source: 'IDF / Lebanese health officials' },
    lat: 33.84,
    lng: 35.51,
    zoom: 14,
    sourceUrl: 'https://www.aljazeera.com/news/2024/7/31/hezbollahsays-top-commander-fuad-shukr-killed-in-israel-strike-on-beirut'
  },
  {
    id: 'haniyeh-assassinated',
    date: '2024-07-31',
    title: 'Hamas leader Haniyeh assassinated in Tehran — bomb in guesthouse',
    category: 'military_strike',
    description: 'Ismail Haniyeh, Hamas\' political leader, killed by a remotely detonated explosive smuggled into his IRGC guesthouse in Tehran months earlier. He was attending Iran\'s presidential inauguration. Iran\'s Supreme Leader Khamenei vows revenge. The assassination campaign reaches deep into Iran itself.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=0qofJJQFhaM', label: 'Al Jazeera: Hamas Leader Haniyeh Assassinated in Tehran' }
    ],
    casualties: { killed: 2, source: 'Hamas / Iranian state media' },
    lat: 35.69,
    lng: 51.39,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/news/2024/7/31/hamass-political-chief-ismail-haniyeh-assassinated-in-iran-state-media'
  },
  {
    id: 'tabeen-school-strike',
    date: '2024-08-10',
    title: 'Tabeen school bombed during morning prayer — 100+ killed',
    category: 'military_strike',
    description: 'Israeli strike hits Al-Tabeen school in Gaza City during morning prayer. School was sheltering displaced families. 100+ killed. Sixth school hit in 10 days. By now: 40,000+ Palestinians killed.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=HfpZA_3J3Y4', label: 'Al Jazeera: Aftermath of Israeli Airstrike on al-Tabin School' }
    ],
    casualties: { killed: 100, injured: 150, source: 'Gaza Civil Defense' },
    lat: 31.51,
    lng: 34.44,
    zoom: 14,
    sourceUrl: 'https://www.aljazeera.com/news/2024/8/10/israeli-strike-on-gaza-school-kills-over-100-palestinian-civil-defence'
  },
  {
    id: 'west-bank-raids',
    date: '2024-08-28',
    title: 'Largest West Bank raids in 20 years — Jenin, Tulkarem, Tubas',
    category: 'military_strike',
    description: 'IDF launches "Operation Summer Camps" — largest West Bank operation since 2002. Hundreds of troops with bulldozers and air support raid Jenin, Tulkarem, Tubas simultaneously. 70% of Jenin streets bulldozed, 20 km water/sewage destroyed. 80% of refugee camp loses water.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=TnEB0fbaxQc', label: 'Al Jazeera: Largest West Bank Assault in Two Decades' }
    ],
    casualties: { killed: 30, source: 'Palestinian Ministry of Health (Aug 28-Sep 7)' },
    lat: 32.46,
    lng: 35.29,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/news/2024/8/28/at-least-7-killed-as-israel-launches-major-raid-on-occupied-west-bank'
  },
  {
    id: 'six-hostages-dead',
    date: '2024-09-01',
    title: '6 hostages found shot dead in Rafah tunnel — Israel erupts in protest',
    category: 'escalation',
    description: 'IDF finds bodies of 6 hostages (including Hersh Goldberg-Polin, 23) in a tunnel 20m underground in Rafah. Shot by Hamas guards on Aug 29, just before IDF reached the tunnel. 500,000+ Israelis protest demanding hostage deal. Histadrut calls general strike. Ben Gurion Airport shuts down.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=LzfrCiSblBc', label: 'NBC News: 6 Hostages Found Dead Including American' }
    ],
    casualties: { killed: 6, source: 'IDF / Israel Ministry of Health' },
    lat: 31.21,
    lng: 34.23,
    zoom: 14,
    sourceUrl: 'https://www.npr.org/2024/09/01/nx-s1-5096754/6-hostages-in-gaza-were-found-dead-by-the-israeli-military'
  },
  {
    id: 'hezbollah-pagers',
    date: '2024-09-17',
    title: 'Pager and walkie-talkie attacks — 42 killed, 4,000 wounded',
    category: 'escalation',
    description: 'Israel detonates thousands of booby-trapped pagers (Sep 17) and walkie-talkies (Sep 18) used by Hezbollah across Lebanon. Years-long supply chain infiltration operation. 42 killed (including 12 civilians), 4,000 wounded. 1,500 Hezbollah fighters incapacitated. Victims lose fingers, hands, eyes. Unprecedented — turns everyday devices into weapons.',
    casualties: { killed: 42, injured: 4000, source: 'Lebanese government / Hezbollah' },
    lat: 33.89,
    lng: 35.5,
    zoom: 8,
    sourceUrl: 'https://www.reuters.com/world/middle-east/hezbollah-members-wounded-when-pagers-exploded-lebanon-sources-2024-09-17/',
    mediaUrls: [
      { type: 'news', url: 'https://www.aljazeera.com/news/2024/9/18/more-devices-exploding-across-lebanon-whats-happening', label: 'Al Jazeera: Day 2 walkie-talkie explosions' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=CYmuK_pLIbQ', label: 'Channel 4: Hezbollah Pager Explosions' }
    ]
  },
  {
    id: 'lebanon-deadliest-day',
    date: '2024-09-23',
    title: 'Lebanon\'s deadliest day since civil war — 558 killed in 1,600 strikes',
    category: 'escalation',
    description: 'Israel launches "Operation Northern Arrows" — 1,600 airstrikes across Lebanon in a single day. 558 killed (50 children, 94 women), 1,835 injured. Deadliest day since the civil war ended in 1990. Roughly half the total killed in the entire 34-day 2006 war — in one day.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=pS-jnYK_Yh0', label: 'PBS NewsHour: Israeli Strikes Kill Hundreds in Deadliest Day' }
    ],
    casualties: { killed: 558, injured: 1835, source: 'Lebanese Ministry of Health' },
    lat: 33.85,
    lng: 35.86,
    zoom: 8,
    sourceUrl: 'https://www.cnn.com/2024/09/24/middleeast/israel-strikes-lebanon-hezbollah-explainer-intl-hnk/'
  },
  {
    id: 'nasrallah-killed',
    date: '2024-09-27',
    title: 'Nasrallah killed in massive Beirut airstrike',
    category: 'military_strike',
    description: 'Israeli airstrike with 80+ bunker busters on Hezbollah HQ in Dahieh, Beirut kills Secretary-General Hassan Nasrallah. Entire apartment block leveled. Iran vows revenge. The region is on the edge. Lebanon war toll: 4,000+ killed, 1M+ displaced.',
    casualties: { killed: 300, injured: 500, displaced: 1000000, source: 'Lebanese Health Ministry / OCHA (late Sep incremental)' },
    lat: 33.84,
    lng: 35.49,
    zoom: 12,
    sourceUrl: 'https://www.aljazeera.com/news/2024/9/28/hezbollah-leader-hassan-nasrallah-killed-in-israeli-air-strike',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=5Q4Zf9Urvmc', label: 'BBC News: Massive Blasts Rock Beirut — Nasrallah Targeted' }
    ],
    movements: [
      { type: 'displacement', from: [33.84, 35.49], to: [34.0, 35.85], label: '1M+ flee southern Lebanon', volume: 1000000 }
    ]
  },
  {
    id: 'iran-october-missiles',
    date: '2024-10-01',
    title: 'Iran fires 180+ ballistic missiles at Israel — True Promise II',
    category: 'retaliation',
    description: 'Iran\'s largest ever missile barrage — 180+ ballistic missiles. Some hit Nevatim and Tel Nof airbases. One Palestinian killed in Jericho by debris. Oil prices spike. Iran calls it "True Promise II" — retaliation for Nasrallah, Haniyeh, and Shukr.',
    lat: 31.77,
    lng: 35.21,
    zoom: 7,
    sourceUrl: 'https://www.bbc.com/news/articles/c5y5z50ly28o',
    mediaUrls: [
      { type: 'news', url: 'https://www.washingtonpost.com/world/2024/10/01/iran-attack-israel-ballistic-missiles/', label: 'Washington Post: Ballistic missiles hit Israel' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=qtixOrBFmKE', label: 'CNN: Iranian Missile Attack on Israel' }
    ]
  },
  {
    id: 'lebanon-ground-invasion',
    date: '2024-10-01',
    title: 'Israel invades Lebanon — 6th invasion since 1978',
    category: 'escalation',
    description: 'Israel crosses the Blue Line into southern Lebanon. IDF describes it as "limited, localised and targeted ground raids." Sixth Israeli invasion of Lebanon since 1978. Reveals it had already conducted 70+ covert raids since Nov 2023.',
    lat: 33.10,
    lng: 35.20,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/news/2024/10/1/israel-says-has-started-targeted-ground-raids-in-lebanon',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=cv7QsAXp9Cs', label: 'BBC News: Israel Troops Enter Lebanon for Ground Raids' }
    ],
  },
  {
    id: 'northern-gaza-siege',
    date: '2024-10-05',
    title: 'Siege of northern Gaza begins — 400,000 trapped',
    category: 'military_strike',
    description: 'IDF reinvades Jabalia, imposes complete siege on northern Gaza. Oct 6: all of northern Gaza declared combat zone, entire population ordered to evacuate. All food aid blocked since Oct 1. Roads destroyed. Pattern matches leaked "Generals\' Plan" to empty northern Gaza. 400,000 civilians trapped.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=ZO38GHKW8zo', label: 'DW News: Israel Gaza Siege — The Generals Plan' }
    ],
    casualties: { killed: 770, injured: 1000, source: 'Gaza Government Media Office (first 19 days)' },
    lat: 31.53,
    lng: 34.50,
    zoom: 12,
    sourceUrl: 'https://www.aljazeera.com/news/2024/10/6/israel-launches-ground-offensive-on-jabalia-again-killing-17',
    movements: [
      { type: 'displacement', from: [31.53, 34.50], to: [31.42, 34.40], label: '400K ordered south', volume: 400000 }
    ]
  },
  {
    id: 'sinwar-killed',
    date: '2024-10-16',
    title: 'Sinwar killed in Rafah — Oct 7 architect found by accident',
    category: 'military_strike',
    description: 'IDF troops from 828th Brigade encounter 3 militants during routine patrol in Rafah. Tank fires on building. Yahya Sinwar — primary architect of Oct 7 — killed after throwing grenades at soldiers. Identity confirmed via dental records from Israeli prison. His death found by accident, not intelligence.',
    lat: 31.28,
    lng: 34.25,
    zoom: 14,
    sourceUrl: 'https://www.aljazeera.com/news/2024/10/18/hamas-confirms-leader-yahya-sinwar-killed-in-combat-in-gaza-by-israeli-army',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=SB7eoaVw4Sk', label: 'BBC Verify: How Israel Killed Hamas Leader Sinwar' }
    ],
  },
  {
    id: 'israel-strikes-iran-oct',
    date: '2024-10-26',
    title: 'Israel strikes Iran — air defenses and missile production hit',
    category: 'military_strike',
    description: 'Israel retaliates across 3 Iranian provinces. Avoids nuclear and oil sites. Iran signals de-escalation. But the precedent is set — direct strikes between nations are now normalized. F-35s fly 1,500+ km.',
    lat: 35.7,
    lng: 51.42,
    zoom: 6,
    sourceUrl: 'https://www.reuters.com/world/middle-east/israeli-warplanes-carry-out-strikes-iran-israeli-military-says-2024-10-26/',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=QmZgrKIdlYM', label: 'France 24: Israel Launches Air Strikes on Iran' }
    ],
  },
  {
    id: 'unrwa-banned',
    date: '2024-10-28',
    title: 'Israel\'s Knesset bans UNRWA — 5.9M refugees affected',
    category: 'diplomatic',
    description: 'Knesset votes 92-10 to ban UNRWA from operating in Israel and revokes 1967 treaty allowing UNRWA to serve Gaza, West Bank, and East Jerusalem. Affects 5.9 million Palestinian refugees. UNRWA head: "violates international law." UN Security Council warns collectively.',
    lat: 31.78,
    lng: 35.23,
    zoom: 10,
    sourceUrl: 'https://www.cnn.com/2024/10/28/middleeast/unrwa-israel-knesset-vote-ban-palestinians-intl/index.html',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=u9BJar3wuAE', label: 'Al Jazeera: Israel Parliament Votes to Ban UNRWA' }
    ],
  },
  {
    id: 'icc-warrants',
    date: '2024-11-21',
    title: 'ICC issues arrest warrants for Netanyahu and Gallant',
    category: 'diplomatic',
    description: 'ICC Pre-Trial Chamber unanimously issues warrants for Israeli PM Netanyahu and former Defense Minister Gallant. Charges: war crimes (starvation as weapon of war, targeting civilians) and crimes against humanity (murder, persecution). First ICC warrant against a Western-backed democratic leader. All 125 member states obligated to arrest.',
    lat: 52.07,
    lng: 4.29,
    zoom: 5,
    sourceUrl: 'https://www.icc-cpi.int/news/situation-state-palestine-icc-pre-trial-chamber-i-rejects-state-israels-challenges',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=n0f361ucubk', label: 'BBC News: Arrest Warrants for Netanyahu and Gallant' }
    ],
  },
  {
    id: 'lebanon-ceasefire',
    date: '2024-11-27',
    title: 'Israel-Hezbollah ceasefire — 14 months of war end',
    category: 'diplomatic',
    description: 'Ceasefire takes effect at 04:00 AM. 60-day halt, Israeli withdrawal from south Lebanon, Hezbollah north of Litani, 5,000 Lebanese troops deployed. Total Lebanon toll: 3,961 killed, 16,520 injured, 1.2M displaced. Same day: Syrian rebels launch offensive, capture Aleppo within 48 hours.',
    lat: 33.89,
    lng: 35.50,
    zoom: 8,
    sourceUrl: 'https://www.npr.org/2024/11/27/g-s1-36024/israel-lebanon-ceasefire-reaction',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=UdRnXrtLvAA', label: 'NBC News: Biden Announces Israel-Hezbollah Ceasefire' }
    ],
    casualties: { killed: 3061, injured: 10185, displaced: 1200000, source: 'Lebanese Ministry of Health / OCHA (Lebanon war cumulative: 3,961 killed, 16,520 injured, 1.2M displaced — 900 already counted in individual events)', children: 200 },
  },
  {
    id: 'assad-falls',
    date: '2024-12-08',
    title: 'Assad regime falls — 50-year dynasty toppled in 11 days',
    category: 'escalation',
    description: 'HTS-led rebels capture Damascus. Assad flees to Moscow. The 50-year dynasty ends in under two weeks. Israel launches 480+ strikes on Syria in 48 hours, destroying 70-80% of military capabilities. IDF invades Golan buffer zone.',
    lat: 33.51,
    lng: 36.28,
    zoom: 6,
    sourceUrl: 'https://www.npr.org/2024/12/07/g-s1-37354/syrian-government-appears-to-have-fallen-in-stunning-end-to-long-rule-of-assad-family',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=1F1rtl0uTx4', label: 'Channel 4: Syrian Rebels Seize Damascus, Assad Regime Falls' },
      { type: 'news', url: 'https://www.cnn.com/2024/12/10/middleeast/israel-syria-assad-strikes-intl', label: 'CNN: Israel launches 480+ strikes on Syria' }
    ]
  },
  {
    id: 'kamal-adwan-destroyed',
    date: '2024-12-27',
    title: 'IDF storms and burns last hospital in northern Gaza',
    category: 'military_strike',
    description: 'IDF storms Kamal Adwan — last functioning hospital in northern Gaza. Sets fire to lab, surgical unit, operating theaters. 350 people forcibly removed (75 patients, 185 medical staff). Female staff report forced stripping and beatings. WHO confirms hospital out of service. 75,000 Palestinians in northern Gaza left without any major medical facility.',
    lat: 31.54,
    lng: 34.51,
    zoom: 14,
    sourceUrl: 'https://www.aljazeera.com/news/2024/12/27/israeli-soldiers-burn-gazas-kamal-adwan-hospital-force-hundreds-to-leave',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=RT5raz7RxB8', label: 'Al Jazeera: Gaza Hospital on Fire — Kamal Adwan Under Attack' }
    ],
  },
  {
    id: 'gaza-end-2024',
    date: '2024-12-31',
    title: 'Gaza 2024: 45,000+ killed, 80% of buildings damaged',
    category: 'humanitarian',
    description: 'By year end: 45,000+ killed (MoH), likely 60,000+ (Lancet). 100,000+ injured. 1.9M displaced — 90% of population. 80% of buildings damaged or destroyed. Every university destroyed. 60% housing uninhabitable. No hospital in northern Gaza. 1,072 IDF soldiers killed. 192 journalists killed — deadliest year for press in modern history.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=ed_oqBtKuy0', label: 'Al Jazeera: One Year of War on Gaza — A War of Firsts' }
    ],
    casualties: { killed: 3000, displaced: 1900000, source: 'Gaza MoH (incremental Oct-Dec 2024)', children: 1500 },
    lat: 31.42,
    lng: 34.36,
    zoom: 10,
    sourceUrl: 'https://www.ochaopt.org/content/hostilities-in-the-gaza-strip-and-israel-reported-impact-day-453'
  },

  // ══════════════════════════════════════════════
  // 2025: CEASEFIRE, 12-DAY WAR, TOWARD FULL WAR
  // ══════════════════════════════════════════════
  {
    id: 'jan15-gaza-ceasefire-deal',
    date: '2025-01-15',
    title: 'Gaza ceasefire deal announced — 33 hostages for 1,900 prisoners',
    category: 'diplomatic',
    description: 'After months of negotiations, Qatar brokers ceasefire: 33 Israeli hostages for ~1,900 Palestinian prisoners in phase one (42 days). Three phases covering hostage returns, full withdrawal, and governance. Both sides accept. First real hope since November 2023.',
    lat: 25.2854,
    lng: 51.5310,
    zoom: 5,
    sourceUrl: 'https://www.npr.org/2025/01/15/g-s1-42883/ceasefire-israel-hamas-gaza-hostage-release',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=Oozhx6xgQ0U', label: 'NBC News: Hamas and Israel Agree to Ceasefire Deal' }
    ],
  },
  {
    id: 'jan19-ceasefire-begins',
    date: '2025-01-19',
    title: 'Ceasefire begins — first 3 hostages freed, Gaza celebrates',
    category: 'diplomatic',
    description: 'Ceasefire takes effect after brief delay. Hamas releases 3 female hostages: Romi Gonen (24), Doron Steinbrecher (31), Emily Damari (28). Massive celebrations across Gaza as bombs stop for first time in 469 days. By now: ~46,000 Palestinians killed since Oct 7.',
    lat: 31.5,
    lng: 34.47,
    zoom: 10,
    sourceUrl: 'https://www.npr.org/2025/01/19/g-s1-43565/gaza-ceasefire-begins-after-delay',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=tdPhh2VjdSE', label: 'DW News: Hostage Handover as Ceasefire Begins' }
    ],
  },
  {
    id: 'jan20-trump-inaugurated',
    date: '2025-01-20',
    title: 'Trump inaugurated — "maximum pressure 2.0" on Iran',
    category: 'diplomatic',
    description: 'Trump takes office, issues ultimatum to Iran: complete halt to enrichment within 90 days. Sanctions reimposed. Releases 2,000-pound bomb shipments Biden had paused.',
    lat: 38.9,
    lng: -77.04,
    zoom: 5,
    sourceUrl: 'https://www.reuters.com/world/trumps-maximum-pressure-iran-2025-01-20/',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=g14ts0KYa98', label: 'PBS NewsHour: Trump Sworn In as 47th President' }
    ],
  },
  {
    id: 'jan21-operation-iron-wall',
    date: '2025-01-21',
    title: 'Operation Iron Wall — largest West Bank incursion in 20 years',
    category: 'military_strike',
    description: 'IDF launches "Operation Iron Wall" in Jenin, then Tulkarm, Tubas. Helicopter gunfire, airstrikes, tanks deployed for first time since 2000s. Palestinian Authority participates in joint ops — unprecedented. 126 killed by June, 40,000+ displaced, 850 homes demolished.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=SrR7r15-qyU', label: 'Al Jazeera: Seven Killed in Israeli Raid on Jenin' }
    ],
    casualties: { killed: 126, displaced: 40000, source: 'OCHA / B\'Tselem (through Jun 2025)', children: 23 },
    lat: 32.4628,
    lng: 35.2951,
    zoom: 12,
    sourceUrl: 'https://www.hrw.org/report/2025/11/20/all-my-dreams-have-been-erased/israels-forced-displacement-of-palestinians-in-the'
  },
  {
    id: 'jan30-unrwa-ban',
    date: '2025-01-30',
    title: 'UNRWA banned from operating — 6 million refugees affected',
    category: 'humanitarian',
    description: 'Israel\'s ban on UNRWA takes effect — the agency responsible for over half of Gaza aid delivery barred from operating in Gaza, East Jerusalem, West Bank. 6 million Palestinian refugees affected. 4 more hostages released same day including Agam Berger. The aid lifeline is cut.',
    lat: 31.7683,
    lng: 35.2137,
    zoom: 8,
    sourceUrl: 'https://www.aljazeera.com/news/2025/1/30/israels-ban-on-unrwa-comes-into-effect-despite-backlash',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=_Ok6zK64SqE', label: 'ABC News: Israeli Ban on UNRWA Begins' }
    ],
  },
  {
    id: 'mar2-aid-cutoff',
    date: '2025-03-02',
    title: 'Israel cuts ALL humanitarian aid to Gaza during Ramadan',
    category: 'humanitarian',
    description: 'Israel shuts down entry of all humanitarian aid — food, fuel, medicine — during Ramadan. Days later cuts electricity to main desalination plant serving 500,000 people. UNRWA blocked from any deliveries for 6 months. Child malnutrition will triple by August.',
    lat: 31.2297,
    lng: 34.2452,
    zoom: 12,
    sourceUrl: 'https://www.unrwa.org/resources/reports/unrwa-situation-report-186-situation-gaza-strip-and-west-bank-including-east-jerusalem',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=Tk9wFAp6aa4', label: 'BBC News: Israel Blocks All Humanitarian Aid Into Gaza' }
    ],
  },
  {
    id: 'mar15-operation-rough-rider',
    date: '2025-03-15',
    title: 'US bombs Yemen — Operation Rough Rider against Houthis',
    category: 'military_strike',
    description: 'Trump launches massive air campaign targeting Houthi positions. B-2 stealth bombers deployed. 1,000+ targets struck. Houthis resumed Red Sea attacks after Israel blocked aid. ~300 killed including 25 civilians and 4 children.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=wI4AWaCnTmo', label: 'BBC News: US Launches Air Strikes on Yemen Houthis' }
    ],
    casualties: { killed: 300, source: 'Yemen Data Project', children: 4 },
    lat: 15.3694,
    lng: 44.1910,
    zoom: 7,
    sourceUrl: 'https://www.aljazeera.com/news/2025/3/28/us-hits-multiple-targets-in-yemen-report'
  },
  {
    id: 'mar18-ceasefire-broken',
    date: '2025-03-18',
    title: 'Israel breaks ceasefire — "resumed combat in full force"',
    category: 'escalation',
    description: 'Israel launches surprise airstrikes on Gaza, breaking 2-month ceasefire. Netanyahu: "just the beginning." 400+ killed on first day, 591+ in first week — mostly women and children. Far-right Ben Gvir rejoins government. IDF re-seizes Netzarim Corridor, re-divides Gaza north and south.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=diY8XyyKbIM', label: 'Al Jazeera: Israeli Attacks Shatter Gaza Truce' }
    ],
    casualties: { killed: 600, source: 'Gaza MoH (first week of resumed offensive)' },
    lat: 31.5,
    lng: 34.47,
    zoom: 10,
    sourceUrl: 'https://www.npr.org/2025/03/19/nx-s1-5332204/israel-breaks-ceasefire-as-it-strikes-gaza-killing-hundreds'
  },
  {
    id: 'jun12-iaea-non-compliance',
    date: '2025-06-12',
    title: 'IAEA declares Iran non-compliant — first time since 2005',
    category: 'escalation',
    description: 'IAEA Board votes 19-3 finding Iran in breach of nuclear obligations. Iran\'s 60% enriched uranium stockpile up 50% to 408kg — enough for multiple weapons. Iran responds by announcing new enrichment facility at undisclosed location. The diplomatic runway has ended.',
    lat: 48.2082,
    lng: 16.3738,
    zoom: 5,
    sourceUrl: 'https://www.aljazeera.com/news/2025/6/12/un-nuclear-watchdog-says-iran-non-compliant-of-nuclear-safeguards',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=OTjYkjhKxM0', label: 'Al Jazeera: IAEA Mulls Declaring Iran Non-Compliant' }
    ],
  },
  {
    id: 'jun13-operation-rising-lion',
    date: '2025-06-13',
    title: 'Operation Rising Lion — Israel strikes Iran with 200+ jets',
    category: 'military_strike',
    description: 'Israel launches surprise attack: 200+ fighter jets drop 330+ munitions on ~100 targets. Natanz enrichment facility destroyed (above-ground 60% section). Isfahan, Arak hit. Commandos and Mossad on the ground. IRGC chief Salami, Armed Forces chief Bagheri, and 6+ nuclear scientists assassinated.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=3GSPnSijas0', label: 'BBC News: Israel Strikes Iran Nuclear Sites' }
    ],
    casualties: { killed: 1190, injured: 4000, source: 'HRANA (436 civilians, 435 military, 319 unconfirmed)' },
    lat: 33.7244,
    lng: 51.7277,
    zoom: 8,
    sourceUrl: 'https://www.cnn.com/2025/06/12/middleeast/israel-iran-strikes-intl-hnk'
  },
  {
    id: 'jun13-true-promise-iii',
    date: '2025-06-13',
    title: 'Iran retaliates — 550 missiles, Bat Yam apartment hit',
    category: 'retaliation',
    description: 'Hours after Rising Lion, Iran launches Operation True Promise III: 550+ ballistic missiles, 1,000+ drones at Israel. 273 intercepted but 36 hit populated areas. Bat Yam: missile hits 12-story apartment, 9 killed including 3 children. Haifa\'s Bazan refinery hit, forced shutdown. 28 Israeli civilians + 1 soldier killed. 3,238 hospitalized.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=tGcVu2noaUU', label: 'BBC News: Iran Rains Missiles on Israel After Nuclear Strikes' }
    ],
    casualties: { killed: 29, injured: 3238, displaced: 15000, source: 'IDF / HRW' },
    lat: 32.0853,
    lng: 34.7818,
    zoom: 10,
    sourceUrl: 'https://www.hrw.org/news/2025/09/04/iran-missile-strikes-on-israeli-civilians-likely-war-crimes'
  },
  {
    id: 'jun22-midnight-hammer',
    date: '2025-06-22',
    title: 'US B-2 bombers destroy Fordow — bunker busters from 18 hrs away',
    category: 'military_strike',
    description: '7 B-2 Spirit stealth bombers fly 18 hours from Missouri, refueling 3 times, to drop 14 GBU-57 "Massive Ordnance Penetrator" bunker busters on Fordow, Natanz, Isfahan. Submarine fires 30 Tomahawks. DNI declares Iran\'s nuclear facilities "destroyed." IAEA director: Iran can rebuild in "months."',
    lat: 34.8835,
    lng: 50.9689,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/news/2025/6/22/satellite-images-show-damage-from-us-strikes-on-irans-fordow-nuclear-site',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=qXxM83TWDS4', label: 'BBC News: How US Strikes on Iranian Nuclear Sites Unfolded' }
    ],
  },
  {
    id: 'jun24-twelve-day-war-ceasefire',
    date: '2025-06-24',
    title: '12-Day War ends — both sides claim victory',
    category: 'diplomatic',
    description: 'US-Qatar mediated ceasefire: Iran stops at 04:00 GMT, Israel follows 12 hours later. Trump calls it the "12 Day War." Total: 1,190 killed in Iran, 29 in Israel, thousands wounded. Initial violations kill 20 more, but ceasefire holds. Behind the scenes: IRGC commanders pressure Khamenei to rescind nuclear weapons ban.',
    lat: 35.6892,
    lng: 51.3890,
    zoom: 6,
    sourceUrl: 'https://www.aljazeera.com/news/2025/6/24/have-israel-and-iran-agreed-to-a-ceasefire-what-we-know',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=a5QD6oBM8tg', label: 'BBC News: Trump Announces Total Iran-Israel Ceasefire' }
    ],
  },
  {
    id: 'aug10-al-jazeera-journalists',
    date: '2025-08-10',
    title: 'Israel kills Al Jazeera\'s Anas al-Sharif — deadliest press attack',
    category: 'military_strike',
    description: 'IDF strikes press tent near Al-Shifa. 4 Al Jazeera staff killed including Anas al-Sharif (2M followers), plus 2 freelancers — 6 journalists total. Israel claims he headed Hamas cell; Al Jazeera and CPJ call it "completely fabricated." Brings journalist toll to 192. The deadliest single attack on press in the war.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=tuFMhiTA49c', label: 'Al Jazeera: Five Al Jazeera Journalists Killed by Israel' }
    ],
    casualties: { killed: 6, source: 'CPJ / Al Jazeera' },
    lat: 31.5197,
    lng: 34.4441,
    zoom: 15,
    sourceUrl: 'https://www.npr.org/2025/08/12/g-s1-82143/gaza-anas-al-sharif-al-jazeera-israel'
  },
  {
    id: 'gaza-famine',
    date: '2025-08-22',
    title: 'Famine confirmed in Gaza — children starving to death',
    category: 'humanitarian',
    description: 'WHO formally confirms famine — first declaration. 500,000+ in famine. 43,400 children at severe risk of death from malnutrition. 422 starvation deaths in 2025 (760% increase). 55,000 pregnant women face acute malnutrition. Israel has blocked aid for 6 months.',
    casualties: { killed: 8000, source: 'Gaza MoH (incremental Mar-Aug 2025)', children: 3000 },
    lat: 31.42,
    lng: 34.36,
    zoom: 10,
    sourceUrl: 'https://www.who.int/news/item/22-08-2025/famine-confirmed-for-first-time-in-gaza',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=51BvCUpcBTc', label: 'Al Jazeera Fault Lines: Starving Gaza' }
    ]
  },
  {
    id: 'sep9-qatar-strike',
    date: '2025-09-09',
    title: 'Israel airstrikes Qatar — first ever attack on Gulf state',
    category: 'escalation',
    description: 'IDF strikes Hamas leaders meeting in Doha to discuss US ceasefire proposal. 6 killed but all senior targets survive. First Israeli attack on a GCC member state ever. US was not informed — condemns the strike. Qatar furious. The recklessness shocks the world.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=_MZhMS7JntA', label: 'BBC News: Israel Strikes Hamas Leaders in Qatar' }
    ],
    casualties: { killed: 6, source: 'Qatari government' },
    lat: 25.2854,
    lng: 51.5310,
    zoom: 10,
    sourceUrl: 'https://www.npr.org/2025/09/10/g-s1-87942/qatar-israeli-strikes-hamas-gaza-ceasefire'
  },
  {
    id: 'sep15-gaza-city-offensive',
    date: '2025-09-15',
    title: 'Full-scale Gaza City ground offensive — 60K reservists called up',
    category: 'military_strike',
    description: 'Israel launches full ground offensive into Gaza City with multiple armored divisions. 60,000 reservists called up. 1 million people were living in the area — 350,000 flee south. ~1,000 killed in September alone. 1,250 buildings destroyed. Trump demands halt.',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=DMuQQkglfMQ', label: 'CNN: Israel Begins Ground Offensive to Occupy Gaza City' }
    ],
    casualties: { killed: 1000, source: 'Gaza MoH (September 2025)' },
    lat: 31.5017,
    lng: 34.4668,
    zoom: 12,
    sourceUrl: 'https://www.axios.com/2025/09/15/israel-gaza-city-occupation-ground-offensive',
    movements: [
      { type: 'displacement', from: [31.50, 34.47], to: [31.35, 34.31], label: '350K flee south', volume: 350000 }
    ]
  },
  {
    id: 'sep16-un-genocide-finding',
    date: '2025-09-16',
    title: 'UN Commission finds Israel committed genocide in Gaza',
    category: 'diplomatic',
    description: 'Independent UN Commission of Inquiry concludes Israel committed genocide — 4 of 5 genocidal acts under the 1948 Convention: murder, serious harm, destructive conditions, preventing births. Cites officials\' statements including Gallant ("human animals") and Netanyahu as evidence of intent. 70,000+ killed.',
    lat: 46.2044,
    lng: 6.1432,
    zoom: 5,
    sourceUrl: 'https://www.ohchr.org/en/press-releases/2025/09/israel-has-committed-genocide-gaza-strip-un-commission-finds',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=nOda0SlHZww', label: 'BBC News: UN Commission Finds Israel Committed Genocide' }
    ],
  },
  {
    id: 'gaza-ceasefire',
    date: '2025-10-10',
    title: 'Gaza peace deal signed — 20 hostages freed, 2,000 prisoners released',
    category: 'diplomatic',
    description: 'Israel-Hamas sign Trump\'s 20-point plan in Egypt. 20 living hostages freed within 72 hours. 2,000 Palestinian prisoners released. Gaza declared "demilitarized zone." But Israel violates ceasefire 1,620+ times. 442+ Palestinians killed post-deal. By Dec 31: 70,942 official, ~100,000+ estimated true toll.',
    casualties: { killed: 15000, killedAdjusted: 25000, adjustedSource: 'Lancet methodology — indirect deaths from disease, malnutrition, lack of medical care', source: 'Gaza MoH (incremental Aug 2025-Feb 2026)', children: 4000 },
    lat: 31.5,
    lng: 34.47,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/features/2026/2/18/gaza-death-toll-exceeds-75000-as-independent-data-verify-loss',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=Y-kcxcn111A', label: 'Al Jazeera: Gaza Ceasefire Deal Signed at Egypt Summit' },
      { type: 'news', url: 'https://www.thelancet.com/journals/langlo/article/PIIS2214-109X(25)00522-4/fulltext', label: 'Lancet: Independent mortality survey' }
    ]
  },
  {
    id: 'hormuz-tanker-seizures',
    date: '2025-11-17',
    title: 'Iran seizes tankers in Hormuz — threatens to "set ships ablaze"',
    category: 'chokepoint',
    description: 'IRGC seizes Marshall Islands-flagged tanker in Strait of Hormuz. A second seized in December near Qeshm Island. Senior IRGC official declares Hormuz "closed" and threatens to set any passing vessel ablaze. 21% of world oil transit at risk. Insurance rates double. The Hormuz card is played.',
    facilityId: 'strait-of-hormuz',
    lat: 26.57,
    lng: 56.25,
    zoom: 8,
    sourceUrl: 'https://news.usni.org/2025/11/17/iran-strait-of-hormuz-tanker-seizure-violates-international-law-centcom-says',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=RExNXJKITNE', label: 'Hindustan Times: Iran Seizes Oil Tanker in Strait of Hormuz' }
    ],
  },

  // ══════════════════════════════════════════════
  // 2026: THE IRAN WAR
  // ══════════════════════════════════════════════
  {
    id: 'us-israel-strikes-iran-nuclear',
    date: '2026-02-28',
    title: 'US/Israel bomb Iran — nuclear sites destroyed, Khamenei killed',
    category: 'military_strike',
    description: 'Joint Operation Radiant Storm strikes Natanz (3,000 centrifuges destroyed), Fordow (underground halls collapsed by GBU-57 bunker busters), Isfahan (UCF leveled). IDF F-35s hit IRGC compound in Tehran — Supreme Leader Khamenei killed along with 14 senior commanders. US B-2 bombers from Diego Garcia strike air defense networks. A stray GBU-39 hits a girls\' school in Minab: 175 children and teachers killed — image goes viral worldwide. Iran declares war within 90 minutes. 3.2M displaced within 2 weeks as cities near military targets evacuate. Satellite FIRMS data shows fires at 22 distinct sites across Iran.',
    casualties: { killed: 1444, injured: 18551, displaced: 3200000, source: 'Iran Health Ministry', killedAdjusted: 3114, adjustedSource: 'HRANA — 1,354 civilians, 1,138 military, 622 unclassified', children: 175 },
    lat: 33.72,
    lng: 51.73,
    zoom: 6,
    sourceUrl: 'https://www.washingtonpost.com/national-security/2026/02/28/us-israel-iran-nuclear-strike/',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=V52iJ-ZDkJY', label: 'CNN: US & Israel Launch Attack on Iran' },
      { type: 'news', url: 'https://www.aljazeera.com/news/2026/2/28/us-israel-bomb-iran-a-timeline-of-talks-and-threats-leading-up-to-attacks', label: 'Al Jazeera: Timeline of escalation' },
      { type: 'news', url: 'https://www.npr.org/2026/02/28/g-s1-112026/why-is-the-u-s-attacking-iran', label: 'NPR: Why the US attacked' },
      { type: 'news', url: 'https://www.bbc.com/news/world-middle-east-68901234', label: 'BBC: Khamenei killed in airstrike' },
      { type: 'news', url: 'https://www.reuters.com/world/middle-east/us-israel-iran-strikes-nuclear-sites-2026-02-28/', label: 'Reuters: Nuclear sites destroyed' }
    ]
  },
  {
    id: 'ras-tanura-strike',
    date: '2026-03-02',
    time: '03:40',
    title: 'Iran hits Ras Tanura — Saudi\'s largest refinery burns',
    category: 'facility_damage',
    description: '12 Iranian Shahed-136 drones evade Saudi air defenses. 3 strike the 33-million-barrel tank farm, igniting a crude storage tank that burns for 36 hours. Satellite imagery (Planet Labs) shows a smoke plume 40 km long drifting over the Persian Gulf. Ras Tanura — Saudi\'s largest refinery at 550K BPD — shuts down entirely. 6 million barrels/day of export capacity from the adjacent terminal disrupted. Aramco declares force majeure on Asian contracts. Brent crude jumps $12/barrel in 4 hours.',
    facilityId: 'ras-tanura',
    lat: 26.6427,
    lng: 50.1546,
    zoom: 12,
    sourceUrl: 'https://en.wikipedia.org/wiki/2026_Aramco_refinery_attack',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=4_cVrY6-mDM', label: 'WION: Breaking — Drone strike hits Saudi Aramco oil refinery' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=T4n-z92pRHQ', label: 'Euronews: Drones hit Saudi Ras Tanura refinery' },
      { type: 'news', url: 'https://www.bloomberg.com/news/articles/2026-03-02/saudi-arabia-s-ras-tanura-refinery-shuts-down-after-drone-attack', label: 'Bloomberg: Saudi Aramco halts Ras Tanura operations after drone strike' },
      { type: 'news', url: 'https://www.euronews.com/2026/03/02/drones-hit-saudi-ras-tanura-refinery-as-iran-strikes-targets-across-region', label: 'Euronews: Drones hit Saudi Ras Tanura refinery as Iran strikes across region' },
      { type: 'news', url: 'https://www.npr.org/2026/03/06/nx-s1-5736593/middle-east-iran-energy-lng', label: 'NPR: Middle East conflicts avoided energy facilities in the past — not this war' },
      { type: 'news', url: 'https://www.aljazeera.com/news/2026/3/4/which-oil-and-gas-facilities-in-the-gulf-have-been-attacked', label: 'Al Jazeera: Which oil and gas facilities in the Gulf have been attacked? (infographic)' }
    ]
  },
  {
    id: 'bapco-strike',
    date: '2026-03-09',
    time: '02:15',
    title: 'Iran sets Bahrain\'s ONLY refinery ablaze — force majeure declared',
    category: 'facility_damage',
    description: 'Ballistic missile and drone combination strike on BAPCO Sitra refinery, Bahrain\'s sole refining facility (267K BPD). Direct hit on the catalytic cracking unit causes a massive hydrocarbon fire visible from Manama, 15 km away. 2 workers killed, 32 injured. BAPCO declares force majeure. Bahrain drops to ZERO domestic refining capacity. US 5th Fleet base scrambles fuel from reserve stocks. Bahrain requests emergency fuel shipments from UAE. NASA FIRMS detects FRP exceeding 300 MW — one of the highest readings in the Gulf conflict.',
    casualties: { killed: 2, injured: 32, source: 'Bahrain News Agency' },
    facilityId: 'bapco-sitra',
    lat: 26.15,
    lng: 50.6167,
    zoom: 13,
    sourceUrl: 'https://www.euronews.com/business/2026/03/09/bapco-declares-force-majeure-as-iran-sets-bahrains-only-refinery-ablaze',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=TPE6MUTTx7c', label: 'WION: Missile hits Bahrain Bapco refinery, oil facility damaged' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=VGBvLVhDA9A', label: 'Oneindia: Iran\'s Shahed drones BOMB Bahrain\'s largest oil facility' },
      { type: 'news', url: 'https://www.bloomberg.com/news/articles/2026-03-09/bahrain-s-bapco-energies-declares-force-majeure-on-operations-mmitmqq7', label: 'Bloomberg: Bapco Energies declares force majeure after refinery damaged' },
      { type: 'news', url: 'https://english.alarabiya.net/News/gulf/2026/03/09/bahrain-s-bapco-declares-force-majeure-after-iran-strikes-statement', label: 'Al Arabiya: Bahrain\'s Bapco declares force majeure after Iran strikes' },
      { type: 'news', url: 'https://oilprice.com/Latest-Energy-News/World-News/Drone-Strike-Hits-Bahrain-Refinery-as-Crack-Spreads-Surge.html', label: 'OilPrice: Drone strike hits Bahrain refinery as crack spreads surge' },
      { type: 'news', url: 'https://news.cgtn.com/news/2026-03-09/Bahrain-s-oil-company-Bapco-declares-force-majeure-following-explosion-1Lnkq6SzqY8/p.html', label: 'CGTN: BAPCO force majeure following explosion' }
    ]
  },
  {
    id: 'kharg-island-strike',
    date: '2026-03-13',
    time: '04:30',
    title: 'US bombs 90+ targets on Kharg Island — Iran\'s oil lifeline severed',
    category: 'military_strike',
    description: 'USS Eisenhower carrier strike group launches 90+ Tomahawk cruise missiles and 40 air sorties at Kharg Island, Iran\'s critical oil export hub handling 90% of crude exports (1.5M BPD). Loading platforms, pipelines, storage tanks, and radar installations destroyed. FIRMS satellites detect 12 distinct fire signatures across the island over 48 hours. Oil slick spreads 8 km into the Persian Gulf. Iran\'s oil revenue — its economic lifeline — effectively cut off. Environmental disaster: estimated 200,000 tons CO₂ in first 3 days of fires. Trump posts bombing footage, says US "totally obliterated every military target."',
    facilityId: 'kharg-island',
    lat: 29.2333,
    lng: 50.3167,
    zoom: 12,
    sourceUrl: 'https://www.washingtonpost.com/politics/2026/03/13/trump-us-iran-war-kharg-island-oil/',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=bo5U2CXtOfw', label: 'CNN: Trump says Iran\'s Kharg Island bombed, US deploying 2,500 to Mideast' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=nHghIBRnjq0', label: 'CBS News: Trump touts U.S. strike on Iran\'s Kharg Island' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=5wmc0OfDR1E', label: 'FRANCE 24: Why did the US bomb Kharg Island? What is its significance?' },
      { type: 'news', url: 'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-13-26', label: 'CNN Live: Trump says US \'totally obliterated every military target\' at Iran oil hub' },
      { type: 'news', url: 'https://www.nbcnews.com/world/iran/iran-threatens-strike-oil-facilities-us-hits-military-targets-kharg-is-rcna263453', label: 'NBC News: US bombing of Kharg Island sparks new threats to Gulf oil infrastructure' },
      { type: 'news', url: 'https://www.cnbc.com/2026/03/13/iran-war-oil-kharg-island-trump-us-israel-middle-east-crisis.html', label: 'CNBC: What happens if Trump pushes to seize Kharg Island' },
      { type: 'news', url: 'https://www.aljazeera.com/news/2026/3/14/us-attacks-military-sites-on-irans-kharg-island-home-to-vast-oil-facility', label: 'Al Jazeera: US attacks military sites on Iran\'s Kharg Island oil facility' },
      { type: 'news', url: 'https://www.cbc.ca/news/world/us-iran-war-kharg-island-9.7128795', label: 'CBC: Iran vows retaliation for US attack on Kharg Island oil hub as war enters 3rd week' },
      { type: 'news', url: 'https://www.axios.com/2026/03/16/kharg-island-iran-war-trump-hormuz-strait', label: 'Axios: Kharg Island — what to know about Iran oil hub amid Trump war threats' },
      { type: 'news', url: 'https://en.wikipedia.org/wiki/2026_Kharg_Island_raid', label: 'Wikipedia: 2026 Kharg Island raid' },
      { type: 'news', url: 'https://time.com/article/2026/03/14/kharg-island-trump-oil/', label: 'TIME: What to know about Kharg Island' }
    ]
  },
  {
    id: 'shah-fujairah-strikes',
    date: '2026-03-16',
    time: '01:45',
    title: 'Iran hits UAE — Shah Gas, Fujairah, Dubai airport fuel tanks',
    category: 'facility_damage',
    description: 'Coordinated IRGC strike wave hits 3 UAE targets simultaneously. Shah Gas Field (giant sour gas processing facility) engulfed in flames after cruise missile hits the sulfur recovery unit — NASA FIRMS shows 450+ MW fire radiative power. Fujairah oil storage terminal: 2 tanks burning, fire crews from 4 emirates respond. Dubai airport fuel depot: jet fuel tank struck, DXB diverts all flights for 18 hours. 8 killed (6 civilian workers, 2 security). 157 injured. UAE — previously trying to stay neutral — activates defense pact with US. Oil prices jump as Iran warns Strait of Hormuz \'cannot be the same.\'',
    casualties: { killed: 8, injured: 157, source: 'UAE authorities / HRW' },
    facilityId: 'shah-gas-field',
    lat: 23.4,
    lng: 53.7,
    zoom: 8,
    sourceUrl: 'https://www.bloomberg.com/news/articles/2026-03-16/drone-strike-sets-uae-natural-gas-field-ablaze-abu-dhabi-says',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=AX92P_hOP2I', label: 'Oneindia: Shah Oil Hub BURNED by Iran — UAE oil fields in FLAMES' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=5L9_NjFcYnI', label: 'Hindustan Times: Fire at UAE\'s Fujairah port after Iran drone strike' },
      { type: 'news', url: 'https://www.cnbc.com/2026/03/17/iran-war-uae-energy-gas-field-oil-fujairah-strait-of-hormuz.html', label: 'CNBC: Iran targets UAE energy infrastructure as gas field set ablaze' },
      { type: 'news', url: 'https://www.aljazeera.com/news/2026/3/17/drone-sparks-fire-at-uae-oil-site-as-gulf-takes-more-hits-amid-iran-war', label: 'Al Jazeera: Drone sparks fire at UAE oil site as Gulf takes more hits' },
      { type: 'news', url: 'https://www.cnn.com/2026/03/17/business/oil-prices-strait-iran-attacks-intl', label: 'CNN: Oil prices jump as Iran warns Strait of Hormuz \'cannot be the same\'' },
      { type: 'news', url: 'https://www.worldoil.com/news/2026/3/16/drone-strike-sparks-fire-at-uae-s-shah-gas-field-operated-by-adnoc-occidental/', label: 'World Oil: Drone strike sparks fire at UAE\'s Shah gas field' },
      { type: 'news', url: 'https://en.wikipedia.org/wiki/2026_Iranian_strikes_on_the_United_Arab_Emirates', label: 'Wikipedia: 2026 Iranian strikes on the United Arab Emirates' }
    ]
  },
  {
    id: 'south-pars-strike',
    date: '2026-03-18',
    time: '02:10',
    title: 'South Pars obliterated — world\'s largest gas field offline',
    category: 'military_strike',
    description: 'Israel strikes South Pars gas field complex with precision munitions. 4 of 7 gas treatment plants destroyed. The facility — world\'s largest natural gas field producing 14 BCF/day (shared with Qatar\'s North Field) — goes completely offline. Iran loses 60%+ of domestic gas supply. 30 million Iranians face heating/cooking gas shortages. Massive fires detected by VIIRS satellite: combined FRP exceeds 800 MW across the complex. Smoke visible from space. Environmental monitors estimate 50,000 tons CO₂/day from the fires. European gas prices spike 40% on disruption fears. Analysts warn this attack crosses a "red line" — targeting upstream energy assets shared with a neutral state.',
    facilityId: 'south-pars',
    lat: 27.4833,
    lng: 52.6,
    zoom: 11,
    sourceUrl: 'https://www.cbsnews.com/live-updates/iran-war-israel-strike-south-pars-gas-field-trump-threat-oil-gas-prices/',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=c-v3ScBGxUk', label: 'Reuters: Israeli strike sets Iran\'s South Pars gas field ablaze' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=ad_Zoy2u2qo', label: 'The Independent: Fire rages at Iran\'s South Pars gas field after Israeli strike' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=J-aX-HMNH3Q', label: 'BBC News: Oil and gas prices surge after Israel strikes world\'s biggest gas field' },
      { type: 'news', url: 'https://www.bloomberg.com/news/articles/2026-03-18/iran-says-strikes-hit-key-south-pars-gas-field-oil-facilities', label: 'Bloomberg: Iran says US-Israeli strikes hit South Pars gas field' },
      { type: 'news', url: 'https://www.cnn.com/2026/03/19/middleeast/iran-qatar-south-pars-gas-field-explainer-intl', label: 'CNN: What is South Pars and why is Israel\'s attack an escalation?' },
      { type: 'news', url: 'https://foreignpolicy.com/2026/03/18/iran-south-pars-gas-field-oil-energy-strikes-qatar-israel-khatib-larijani/', label: 'Foreign Policy: Iran, Qatar accuse Israel of striking South Pars' },
      { type: 'news', url: 'https://www.aljazeera.com/news/2026/3/18/oil-prices-surge-after-israeli-strike-on-iran-gasfield-irans-threats', label: 'Al Jazeera: Oil prices surge after Israeli strike on Iran gas field' },
      { type: 'news', url: 'https://thesoufancenter.org/intelbrief-2026-march-18b/', label: 'Soufan Center: Red Line Crossed — Israel targets upstream energy assets' },
      { type: 'news', url: 'https://www.axios.com/2026/03/18/israel-strikes-iran-natural-gas-infrastructure', label: 'Axios: Israel strikes Iran\'s natural gas infrastructure' }
    ]
  },
  {
    id: 'ras-laffan-retaliation',
    date: '2026-03-18',
    time: '08:45',
    title: 'Iran retaliates — missile hits Ras Laffan, 20% of global LNG at risk',
    category: 'retaliation',
    description: 'Hours after South Pars, Iran fires 5 Fateh-110 ballistic missiles at Ras Laffan Industrial City in Qatar — the world\'s largest LNG export facility handling 20% of global supply (77 MTPA). THAAD intercepts 4, but 1 strikes a loading berth. Resulting fire damages 2 LNG trains and a condensate processing unit. Qatar declares force majeure on 15% of LNG contracts. Asian spot LNG prices double overnight. Japan and South Korea scramble for alternative supply. Fire burns for 20+ hours; FIRMS detects 350 MW FRP. Estimated 8,000 tons CO₂ from the fire. Qatar condemns "blatant Iranian attack" and expels Iranian attaches.',
    facilityId: 'ras-laffan',
    lat: 25.9,
    lng: 51.5333,
    zoom: 12,
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/18/qatar-says-iran-missile-attack-sparks-fire-causes-damage-at-gas-facility',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=S7N_fiB-chw', label: 'WION: Iran strikes back — Iranian missile damages Qatar\'s Ras Laffan LNG facility' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=bPiOKgi1KdY', label: 'FRANCE 24: Qatar orders departure of Iranian diplomats over gas facility attack' },
      { type: 'news', url: 'https://www.bloomberg.com/news/articles/2026-03-19/iran-strike-damages-17-of-qatar-lng-for-3-5-years-reuters-says', label: 'Bloomberg/Reuters: Iran strike damages 17% of Qatar LNG for 3-5 years' },
      { type: 'news', url: 'https://www.cnbc.com/2026/03/18/iran-war-qatar-ras-laffan-natural-gas-lng.html', label: 'CNBC: Iran missile attack on Qatar causes \'extensive damage\' to huge gas plant' },
      { type: 'news', url: 'https://mofa.gov.qa/en/latest-articles/statements/qatar-condemns--denounces-blatant-iranian-attack-on-ras-laffan-industrial-city', label: 'Qatar Foreign Ministry: Qatar condemns blatant Iranian attack' },
      { type: 'news', url: 'https://www.lngindustry.com/special-reports/19032026/wood-mackenzie-ras-laffan-attacks-fundamentally-reshape-global-lng-outlook/', label: 'LNG Industry: Ras Laffan attacks fundamentally reshape global LNG outlook' },
      { type: 'news', url: 'https://naturalgasintel.com/news/qatarenergy-says-damage-at-lng-facilities-could-take-years-to-repair-upending-supply-outlook/', label: 'NGI: QatarEnergy says damage could take years to repair' }
    ]
  },
  {
    id: 'iran-threatens-targets',
    date: '2026-03-18',
    time: '14:00',
    title: 'Iran names 6 Gulf facilities as targets — orders civilian evacuations',
    category: 'escalation',
    description: 'IRGC spokesman publicly names SAMREF Yanbu, Jubail Industrial City, Al Hosn Gas, Mesaieed Industrial Area, Duqm Refinery, and Kuwait\'s Mina Abdullah as "legitimate military targets." Orders civilian evacuations within 48 hours. First time in modern warfare a state has publicly listed energy targets before striking. Oil markets in free fall — Brent hits $147/barrel (2008 record). UN Secretary General calls emergency session. Pentagon deploys 2 additional carrier groups to Gulf. Analysts say targeting of energy facilities has turned the Iran war into the "worst-case scenario" for Gulf states.',
    lat: 25.0,
    lng: 50.0,
    zoom: 6,
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/18/iran-threatens-to-strike-gulf-energy-facilities-after-south-pars-attack',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=pdikj2yVZFQ', label: 'Al Jazeera: Iran issues evacuation warnings for Gulf energy sites after Israeli strike' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=Es_wof_BClw', label: 'DW News: Iran threatens Gulf states\' energy facilities' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=TpmpX-lw08s', label: 'CRUX LIVE: Qatar, UAE, Saudi Arabia under attack as Iran strikes Gulf gas' },
      { type: 'news', url: 'https://www.bloomberg.com/news/articles/2026-03-18/iran-warns-gulf-nations-of-major-response-after-gas-field-strike', label: 'Bloomberg: Gulf energy sites named as targets by Iran' },
      { type: 'news', url: 'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-18-26', label: 'CNN Live: Trump threatens Iran\'s gas fields, Gulf sites under attack' },
      { type: 'news', url: 'https://theconversation.com/targeting-of-energy-facilities-turned-iran-war-into-worst-case-scenario-for-gulf-states-278730', label: 'The Conversation: Iran war becomes worst-case scenario for Gulf states' },
      { type: 'news', url: 'https://www.military.com/daily-news/2026/03/19/iran-hits-back-multiple-gulf-refineries-after-israeli-strike-its-offshore-gas-field.html', label: 'Military.com: Iran hits back at multiple Gulf refineries' }
    ]
  },
  {
    id: 'mina-al-ahmadi-strike',
    date: '2026-03-19',
    time: '05:20',
    title: 'Iran strikes Kuwait\'s Mina al-Ahmadi — war engulfs the Gulf',
    category: 'facility_damage',
    description: 'Despite 48-hour warning, Iran launches 8 cruise missiles at Mina al-Ahmadi, Kuwait\'s largest refinery (466K BPD). Patriot batteries intercept 5, but 3 hit the crude distillation unit and a naphtha storage tank. Massive fire erupts — FIRMS satellite shows 500+ MW FRP, visible on NASA Worldview. Kuwait — which stayed neutral in every conflict since 1991 — now pulled into war. Refinery produces 35% of Kuwait\'s domestic fuel. Black smoke column rises 3 km high. Fire crews from Kuwait, Saudi Arabia, and US military battle the blaze. Estimated 15,000+ tons CO₂/day from fires across all Gulf facilities now burning. Globe and Mail: "Iran intensifies attacks on Gulf neighbours, spiking global oil prices."',
    casualties: { killed: 3, injured: 47, source: 'Kuwait News Agency' },
    facilityId: 'mina-al-ahmadi',
    lat: 29.0667,
    lng: 48.1667,
    zoom: 12,
    sourceUrl: 'https://www.pbs.org/newshour/world/iran-intensifies-attacks-on-gulf-energy-sites-after-israel-struck-its-key-gas-field',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=39Xos0zbQvc', label: 'CNN-News18: BREAKING — Drone attack hits Kuwait\'s Mina Al-Ahmadi refinery, oil prices spike' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=-dRDjfOG_Gw', label: 'India Today: Iran attacks Kuwait — drone attack sparks fire at Mina Al Ahmadi oil refinery' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=vHVEBj2wuD4', label: 'WION: Iran hits Qatar, Kuwait oil refineries — fresh attack on Israel' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=9aCpcZIdIG8', label: 'Bloomberg: European stocks fall as energy costs surge — The Opening Trade 3/19' },
      { type: 'news', url: 'https://thehill.com/homenews/ap/ap-international/ap-iran-hits-back-at-multiple-gulf-refineries-after-israeli-strike-on-its-offshore-gas-field/', label: 'AP/The Hill: Iran hits back at multiple Gulf refineries' },
      { type: 'news', url: 'https://www.npr.org/2026/03/19/nx-s1-5753520/iran-israel-gas-field-attacks', label: 'NPR: Israel and Iran attack each other\'s gas facilities' },
      { type: 'news', url: 'https://www.theglobeandmail.com/world/article-iran-hits-gulf-refineries-after-israeli-strikes-its-offshore-gas-field/', label: 'Globe and Mail: Iran intensifies attacks, spiking global oil prices' },
      { type: 'news', url: 'https://saudigazette.com.sa/article/659875/world/drone-attacks-hit-kuwait-refineries-fires-contained', label: 'Saudi Gazette/Reuters: Drone strikes hit two Kuwait refineries' },
      { type: 'news', url: 'https://en.wikipedia.org/wiki/2026_Iranian_strikes_on_Kuwait', label: 'Wikipedia: 2026 Iranian strikes on Kuwait' },
      { type: 'news', url: 'https://www.military.com/daily-news/2026/03/17/satellite-images-begin-show-damage-wrought-iran-war.html', label: 'Military.com: Satellite images show damage wrought by Iran war' }
    ]
  },

  // ══════════════════════════════════════════════
  // MARCH 19, 2026 — HAIFA, RAS LAFFAN, YANBU, UAE
  // ══════════════════════════════════════════════
  {
    id: 'haifa-refinery-strike',
    date: '2026-03-19',
    time: '14:30',
    title: 'Iranian missiles hit Israel\'s Bazan refinery in Haifa — fires erupt',
    category: 'retaliation',
    description: 'Iran launches 6 missile salvos at northern Israel. Shrapnel and a direct hit strike the Bazan oil refinery complex in Haifa Bay — Israel\'s largest, producing half of domestic fuel. 15 firefighting teams deployed. Plumes of black smoke rise over the city. Additional damage discovered overnight. Energy Minister says power briefly disrupted. Plant sits adjacent to ammonia storage tanks — chemical disaster narrowly avoided. Refinery says full restoration will take "a few days." Iran says strikes are retaliation for South Pars attack.',
    casualties: { killed: 0, injured: 4, source: 'Israel MDA / Haaretz' },
    facilityId: 'haifa-refinery',
    lat: 32.8000,
    lng: 35.0167,
    zoom: 12,
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/19/israel-says-oil-refinery-hit-in-iranian-missile-attack-no-major-damage',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=gPqE7Qmr4w4', label: 'Iran missile strike hits Israel as deaths mount' },
      { type: 'news', url: 'https://www.jpost.com/israel-news/defense-news/article-890480', label: 'JPost: Bazan refinery damaged after Iran missile barrages' },
      { type: 'news', url: 'https://www.usnews.com/news/world/articles/2026-03-19/iranian-attack-hits-israeli-oil-refinery-in-haifa-some-damage-reported', label: 'US News: Iranian attack hits Israeli oil refinery in Haifa' },
      { type: 'news', url: 'https://themedialine.org/headlines/iranian-missile-hits-haifas-bazan-refineries-triggers-fire-and-hazard-assessment/', label: 'Media Line: Missile hits Bazan refineries, triggers hazard assessment' },
      { type: 'news', url: 'https://www.timesofisrael.com/liveblog-march-19-2026/', label: 'Times of Israel: Iran launches five missile salvos at Israel' }
    ]
  },
  {
    id: 'ras-laffan-second-wave',
    date: '2026-03-19',
    time: '04:00',
    title: 'Qatar confirms 17% LNG capacity destroyed — 3-5 year repair',
    category: 'facility_damage',
    description: 'QatarEnergy CEO Saad al-Kaabi confirms the full scope of damage from Iranian strikes on Ras Laffan: LNG trains S4 and S6 destroyed, Pearl GTL facility offline. 12.8 million tonnes/year of LNG capacity wiped out — 17% of Qatar\'s exports. Repairs estimated at 3-5 years, $26 billion in destroyed infrastructure. Annual revenue loss ~$20 billion. Global helium output cut by 14%. European gas prices doubled since war began. World\'s most important LNG hub crippled. Qatar declares force majeure on affected contracts. Asian buyers scramble for alternative supply.',
    facilityId: 'ras-laffan',
    lat: 25.9000,
    lng: 51.5333,
    zoom: 12,
    sourceUrl: 'https://www.cnbc.com/2026/03/19/iran-attack-qatar-lng-capacity.html',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=7XLFhoV1Aw4', label: 'IEA approves record oil release amid Iran LNG crisis' },
      { type: 'news', url: 'https://www.bloomberg.com/news/articles/2026-03-19/iran-strike-damages-17-of-qatar-lng-for-3-5-years-reuters-says', label: 'Bloomberg: Iran strike damages 17% of Qatar LNG for 3-5 years' },
      { type: 'news', url: 'https://www.aljazeera.com/news/2026/3/19/iran-attacks-cut-17-of-qatars-lng-capacity-for-up-to-5-years-qatarenergy', label: 'Al Jazeera: Iran warns zero restraint if infrastructure attacked again' },
      { type: 'news', url: 'https://globallnghub.com/qatar-lng-capacity-hit-as-ras-laffan-attacks-damage-key-trains.html', label: 'Global LNG Hub: Qatar LNG capacity hit as key trains damaged' },
      { type: 'news', url: 'https://www.enr.com/articles/62702-strike-on-qatar-lng-hub-reveals-risk-in-mega-train-design-at-ras-laffan', label: 'ENR: Strike reveals risk in mega-train design at Ras Laffan' }
    ]
  },
  {
    id: 'yanbu-drone-strike',
    date: '2026-03-19',
    time: '03:15',
    title: 'Iranian drone hits Saudi SAMREF Yanbu refinery — Red Sea route threatened',
    category: 'facility_damage',
    description: 'Iranian drone strikes the SAMREF refinery at Yanbu on Saudi Arabia\'s Red Sea coast. A ballistic missile targeting the adjacent port was intercepted by Patriot batteries. Saudi forces intercept 12+ additional drones within two hours. Yanbu is strategically critical — it processes crude arriving via the 1,200km East-West pipeline from Abqaiq, bypassing the Strait of Hormuz entirely. With Hormuz effectively closed, the Red Sea route via Yanbu was the last major alternative for Saudi oil exports. Damage assessment ongoing.',
    facilityId: 'samref-yanbu',
    lat: 24.0500,
    lng: 38.0667,
    zoom: 10,
    sourceUrl: 'https://www.pbs.org/newshour/world/iran-intensifies-attacks-on-gulf-energy-sites-after-israel-struck-its-key-gas-field',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=T4n-z92pRHQ', label: 'Drones hit Saudi refinery as Iran strikes region' },
      { type: 'news', url: 'https://www.npr.org/2026/03/19/nx-s1-5753520/iran-israel-gas-field-attacks', label: 'NPR: Israel and Iran attack each other\'s gas facilities in major escalation' },
      { type: 'news', url: 'https://www.opb.org/article/2026/03/19/israel-and-iran-attack-gas-facilities-rattling-markets/', label: 'OPB/AP: Israel and Iran attack gas facilities, rattling markets' }
    ]
  },
  {
    id: 'uae-habshan-shutdown',
    date: '2026-03-19',
    time: '06:00',
    title: 'UAE shuts Habshan & Bab gas fields after Iranian missile barrage',
    category: 'facility_damage',
    description: 'Iranian missiles target UAE\'s Habshan gas facility and Bab oil field. Patriot and THAAD systems intercept most incoming missiles, but falling debris forces precautionary shutdown of both facilities. Habshan/Bab complex processes 1.45 BCF/day of sour gas — about 17% of UAE supply. Al Hosn sour gas plant (world\'s largest) adjacent to impact zones. UAE evacuates non-essential workers. Concurrent IRGC strike reported on al-Dhafra air base hosting US forces. UAE now the 4th Gulf state pulled into Iran\'s retaliation campaign.',
    facilityId: 'al-hosn-gas',
    lat: 23.8500,
    lng: 53.1000,
    zoom: 10,
    sourceUrl: 'https://www.cnbc.com/2026/03/17/iran-war-uae-energy-gas-field-oil-fujairah-strait-of-hormuz.html',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=sUokwep7AIw', label: 'Iran escalates Gulf drone and missile attacks' },
      { type: 'news', url: 'https://gulfnews.com/uae/usisrael-war-on-iran-day-20-iran-warns-of-uncontrollable-consequences-uae-intercepts-threats-1.500479442', label: 'Gulf News: UAE intercepts threats as Iran warns of consequences' },
      { type: 'news', url: 'https://theconversation.com/targeting-of-energy-facilities-turned-iran-war-into-worst-case-scenario-for-gulf-states-278730', label: 'The Conversation: Worst-case scenario for Gulf states' }
    ]
  },

  // ══════════════════════════════════════════════
  // MARCH 20, 2026 — KUWAIT AGAIN, HORMUZ BLOCKADE
  // ══════════════════════════════════════════════
  {
    id: 'mina-al-ahmadi-second-wave',
    date: '2026-03-20',
    time: '04:30',
    title: 'Iran hits Kuwait\'s Mina al-Ahmadi AGAIN — second day of strikes',
    category: 'retaliation',
    description: 'Two waves of Iranian drones attack Mina al-Ahmadi refinery for the second consecutive day, this time on Eid al-Fitr morning. Fires erupt across multiple units. Kuwait Petroleum Corporation shuts down additional refinery sections. The 730K BPD facility — one of the Middle East\'s largest — now operating at severely reduced capacity. Kuwait, which has stayed neutral in every regional conflict since 1991, is now fully drawn into the war. France24: "Kuwait refinery hit as Iran marks New Year under shadow of war."',
    facilityId: 'mina-al-ahmadi',
    lat: 29.0667,
    lng: 48.1667,
    zoom: 12,
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/20/kuwait-oil-refinery-hit-again-as-iran-targets-gulf-energy-infrastructure',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=5rldsS79dPc', label: 'Iran continues strikes on Gulf states' },
      { type: 'news', url: 'https://www.upi.com/Top_News/World-News/2026/03/20/iran-Kuwait-refinery-struck/6691773992136/', label: 'UPI: Iran strikes Kuwait refinery for second straight day' },
      { type: 'news', url: 'https://www.france24.com/en/live-news/20260320-israel-strikes-decimated-iran-as-war-roils-markets', label: 'France24: Kuwait refinery hit as Iran marks New Year under shadow of war' },
      { type: 'news', url: 'https://www.cbc.ca/news/world/iran-hits-kuwaiti-oil-refinery-9.7135780', label: 'CBC: Iran hits Kuwaiti oil refinery, explosions boom over Tehran' }
    ]
  },
  {
    id: 'hormuz-vetting-system',
    date: '2026-03-20',
    time: '12:00',
    title: 'Iran building "vetting system" for Hormuz transit — selective blockade hardens',
    category: 'chokepoint',
    description: 'Iran announces it is developing a formal registration and vetting system for ships transiting the Strait of Hormuz. Foreign Minister Araghchi states the strait is "open, but closed to our enemies." This shifts from the initial blanket blockade to a selective chokepoint — Iran decides who passes. 21 million BPD of oil normally transits Hormuz (20% of global supply). Oil prices touch $119/barrel (Brent) before retreating. Netanyahu says Israel is helping to open the strait. Pentagon deploys 2 additional carrier groups. Analysts warn the conflict is entering its most dangerous phase yet.',
    lat: 26.5600,
    lng: 56.2500,
    zoom: 9,
    facilityId: 'strait-of-hormuz',
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/20/iran-developing-a-vetting-system-for-strait-of-hormuz-transit-report',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=fEzHCxz24qc', label: 'Europe and Japan ready to secure Hormuz' },
      { type: 'news', url: 'https://www.cnbc.com/2026/03/19/oil-jumps-iran-strikes-qatar-lng-facility-supply-worries.html', label: 'CNBC: Oil prices fall after Brent briefly touches $119' },
      { type: 'news', url: 'https://www.npr.org/2026/03/20/nx-s1-5753773/global-oil-and-energy-prices-are-reeling-as-the-war-in-the-middle-east-escalates', label: 'NPR: Global energy prices reeling as war escalates' },
      { type: 'news', url: 'https://en.wikipedia.org/wiki/2026_Strait_of_Hormuz_crisis', label: 'Wikipedia: 2026 Strait of Hormuz crisis' }
    ]
  },
  {
    id: 'tehran-nowruz-strikes',
    date: '2026-03-20',
    time: '02:30',
    title: 'Israel bombs Tehran on Nowruz — Persian New Year under fire',
    category: 'escalation',
    description: 'Israeli F-35Is launch a wave of strikes across Tehran as millions of Iranians celebrate Nowruz, the Persian New Year. Multiple explosions reported across the capital including near government buildings. IRGC fires back with missile salvos toward Jerusalem — interceptions reported over the Old City. The symbolic timing of striking on Iran\'s most sacred holiday provokes fury across the Muslim world. UN Secretary General calls it "a new low in this devastating conflict." Death toll from the overnight exchange: 47 in Iran (including 12 civilians), 4 in Israel and the West Bank.',
    casualties: { killed: 51, injured: 200, source: 'Iran Health Ministry / IDF / CNN', children: 4 },
    lat: 35.6892,
    lng: 51.3890,
    zoom: 10,
    sourceUrl: 'https://www.npr.org/2026/03/20/nx-s1-5754550/israel-strikes-tehran-iran-attacks-gulf',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=hUO8axalki0', label: 'Israel and Iran exchange strikes on Persian New Year' },
      { type: 'news', url: 'https://www.cnn.com/2026/03/20/world/video/iran-israel-war-nowruz-geranmayeh-intv-ctw-032010aseg1-cnni-world-fast', label: 'CNN: Israel strikes Iran as country celebrates Persian New Year' },
      { type: 'news', url: 'https://www.euronews.com/2026/03/20/israel-strikes-tehran-as-iran-continues-targeting-energy-infrastructure-across-gulf', label: 'Euronews: Israel strikes Tehran as Gulf energy attacks continue' },
      { type: 'news', url: 'https://www.opb.org/article/2026/03/20/israel-launches-more-strikes-on-tehran-as-iran-continues-attacks-on-gulf-oil-facilities/', label: 'NPR/OPB: Israel launches more strikes on Tehran' },
      { type: 'news', url: 'https://www.fox5ny.com/news/iran-war-latest-march-20-2026', label: 'FOX: Israeli strikes hit Tehran as Iranian drones target Gulf' }
    ]
  },
  {
    id: 'irgc-spokesman-killed',
    date: '2026-03-20',
    time: '05:00',
    title: 'IRGC spokesman Gen. Naini killed — 4th senior leader this week',
    category: 'military_strike',
    description: 'Iran\'s IRGC spokesperson Brigadier General Ali Mohammad Naini, 68, killed in a joint US-Israeli missile strike hours after appearing on state TV insisting Iran\'s missile production was unaffected. His death is the 4th major blow to Iranian leadership this week — after Ali Larijani, Gholamreza Soleimani, and Intelligence Minister Esmaeil Khatib were all killed in strikes. The systematic targeting of Iran\'s leadership echoes Israel\'s decapitation campaigns against Hamas and Hezbollah. Iran vows the killings "will not go unanswered."',
    casualties: { killed: 1, source: 'IRGC statement / Al Jazeera' },
    lat: 35.72,
    lng: 51.42,
    zoom: 11,
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/20/irans-irgc-says-spokesman-ali-mohammad-naini-killed-in-us-israeli-attack',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=juDeo15qtD0', label: 'Destruction in Tehran after Israeli strikes' },
      { type: 'news', url: 'https://english.alarabiya.net/News/middle-east/2026/03/20/iran-s-irgc-spokesman-killed-state-tv', label: 'Al Arabiya: Iran\'s IRGC spokesman killed in US-Israeli strikes' },
      { type: 'news', url: 'https://www.thenationalnews.com/news/mena/2026/03/20/irgc-says-spokesman-killed-in-us-israeli-missile-attack/', label: 'The National: IRGC says spokesman killed in US-Israeli attack' },
      { type: 'news', url: 'https://www.newarab.com/news/irgc-spokesman-killed-us-israel-strike-kuwait-refinery-hit', label: 'New Arab: IRGC spokesman killed as Kuwait refinery hit' },
      { type: 'news', url: 'https://www.dailysabah.com/world/mid-east/irans-irgc-spokesman-killed-in-strike-amid-leadership-crisis/amp', label: 'Daily Sabah: IRGC spokesman killed amid leadership crisis' }
    ]
  },
  {
    id: 'trump-wind-down-signal',
    date: '2026-03-20',
    time: '14:30',
    title: 'Trump floats "winding down" war — but rejects ceasefire, sends more troops',
    category: 'diplomatic',
    description: 'Trump posts on Truth Social: "We are getting very close to meeting our objectives as we consider winding down our great Military efforts in the Middle East." But minutes earlier he told reporters: "I don\'t want to do a ceasefire. You don\'t do a ceasefire when you\'re literally obliterating the other side." Contradicting the wind-down signal, the 11th Marine Expeditionary Unit (2,200+ Marines) deploys from San Diego to the Gulf. Pentagon has spent ~$1 billion/day on the war. Iran dismisses the "wind down" talk — a senior Iranian source tells CNN: "Iran has no such estimate and concludes that the enemy\'s military posture hasn\'t changed."',
    lat: 38.8977,
    lng: -77.0365,
    zoom: 5,
    sourceUrl: 'https://www.cnbc.com/2026/03/20/trump-iran-war-ceasefire.html',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=-B2NE5ms2lA', label: 'Iran war is Europe\'s war — Trump security advisor' },
      { type: 'news', url: 'https://www.thenationalnews.com/news/us/2026/03/20/trump-says-us-is-considering-winding-down-iran-war/', label: 'The National: Trump says US considering winding down Iran war' },
      { type: 'news', url: 'https://www.axios.com/2026/03/20/trump-winding-down-iran-war-hormuz-strait', label: 'Axios: Trump considers winding down without opening Hormuz' },
      { type: 'news', url: 'https://www.pbs.org/newshour/show/as-attacks-on-oil-sites-continue-trump-dismisses-ceasefire-says-iran-is-finished', label: 'PBS: Trump dismisses ceasefire, says Iran is finished' },
      { type: 'news', url: 'https://www.bloomberg.com/news/articles/2026-03-20/trump-says-he-doesn-t-want-ceasefire-in-iran-conflict', label: 'Bloomberg: Trump says he doesn\'t want ceasefire' }
    ]
  },
  {
    id: 'pentagon-200b-request',
    date: '2026-03-20',
    time: '10:00',
    title: 'Pentagon asks for $200B war funding — "$1 billion a day to kill bad guys"',
    category: 'escalation',
    description: 'The Pentagon sends a $200 billion supplemental budget request to the White House to fund the Iran war — the largest war funding request since the initial Iraq invasion. Defense Secretary Hegseth confirms the figure but says it "could move." At ~$1 billion per day, the 21-day war has already cost taxpayers over $20 billion. Bipartisan congressional pushback is immediate. Goldman Sachs warns oil will stay above $100/barrel through 2027. Trump calls it "a small price to pay." The request signals preparation for a longer conflict than the administration\'s original 4-6 week timeline.',
    lat: 38.8719,
    lng: -77.0563,
    zoom: 12,
    sourceUrl: 'https://www.npr.org/2026/03/19/nx-s1-5753520/iran-israel-gas-field-attacks',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=LOXymybZ4D8', label: 'Iran escalation risks stagflation shock' },
      { type: 'news', url: 'https://www.washingtonpost.com/national-security/2026/03/18/iran-cost-budget-pentagon/', label: 'Washington Post: Pentagon seeks $200B for Iran war' },
      { type: 'news', url: 'https://time.com/article/2026/03/20/republican-democrat-lawmakers-condemn-pentagon-iran-war-funding-request/', label: 'TIME: Lawmakers condemn Pentagon\'s $200B request' },
      { type: 'news', url: 'https://www.aljazeera.com/news/2026/3/19/hegseth-says-no-timeframe-for-war-on-iran-as-pentagon-asks-for-200bn', label: 'Al Jazeera: Hegseth says no timeframe as Pentagon asks for $200B' },
      { type: 'news', url: 'https://reason.com/2026/03/20/200-billion-war/', label: 'Reason: Pentagon seeks $200 billion from Congress' },
      { type: 'news', url: 'https://www.armytimes.com/news/pentagon-congress/2026/03/19/it-takes-money-to-kill-bad-guys-pentagon-seeks-200-billion-in-new-funding-for-war-in-iran/', label: 'Army Times: "It takes money to kill bad guys" — Pentagon seeks $200B' }
    ]
  },
  {
    id: 'nato-cowards-hormuz',
    date: '2026-03-20',
    time: '16:00',
    title: 'Trump calls NATO allies "cowards" for refusing to join Hormuz force',
    category: 'diplomatic',
    description: 'Trump publicly lashes out at NATO allies, calling them "cowards" for refusing to contribute warships to a Strait of Hormuz security force. France, Germany, and the UK have all declined to participate, citing the unilateral nature of the US-Israel campaign. The diplomatic rupture deepens as European nations face the energy crisis caused by Hormuz closure but refuse to militarily back the war that caused it. Only Bahrain and UAE have offered port access. Saudi Arabia remains conspicuously silent on military cooperation despite its own facilities being hit by Iran.',
    lat: 50.8503,
    lng: 4.3517,
    zoom: 5,
    sourceUrl: 'https://www.euronews.com/2026/03/20/israel-strikes-tehran-as-iran-continues-targeting-energy-infrastructure-across-gulf',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=eejycD654sI', label: 'Trump blasts NATO allies as Iran war enters day 19' },
      { type: 'news', url: 'https://www.aljazeera.com/news/2026/3/14/trump-says-many-countries-will-send-warships-to-hormuz-amid-iran-blockade', label: 'Al Jazeera: Trump says many countries will send warships to Hormuz' },
      { type: 'news', url: 'https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-20-26', label: 'CNN Live: Iran war day 21 updates' }
    ]
  },

  // ══════════════════════════════════════════════
  // MARCH 21, 2026 — DAY 22: NATANZ, DIEGO GARCIA, 70TH WAVE
  // ══════════════════════════════════════════════
  {
    id: 'natanz-nuclear-strike',
    date: '2026-03-21',
    time: '03:00',
    title: 'US-Israel strikes Natanz nuclear site — IAEA warns of nuclear accident risk',
    category: 'military_strike',
    description: 'US and Israeli forces strike the Shahid Ahmadi Roshan uranium enrichment facility at Natanz — Iran\'s most critical nuclear site. Second strike on Natanz during the war (first hit March 1-3 targeting tunnel entrances). Iran\'s Atomic Energy Organization says "no leakage of radioactive materials." IAEA Director Grossi calls for "military restraint to avoid any risk of a nuclear accident." Israel\'s Defense Minister warns strikes "will increase significantly" in the coming week. The White House frames nuclear prevention as a key war objective. Arms control experts warn any breach of underground centrifuge halls could release uranium hexafluoride.',
    casualties: { killed: 2, injured: 15, source: 'Iran state media / JPost' },
    lat: 33.7225,
    lng: 51.7275,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/21/iran-says-us-and-israel-attacked-natanz-nuclear-facility',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=ETe0ftnltG8', label: 'Iran Natanz nuclear site struck, Diego Garcia targeted' },
      { type: 'news', url: 'https://www.jpost.com/middle-east/iran-news/2026-03-20/live-updates-890625', label: 'JPost: US-Israeli strike targets Natanz nuclear site' },
      { type: 'news', url: 'https://www.timesofisrael.com/liveblog-march-21-2026/', label: 'Times of Israel: Day 22 liveblog' },
      { type: 'news', url: 'https://www.armscontrol.org/issue-briefs/2026-03/us-war-iran-new-and-lingering-nuclear-risks', label: 'Arms Control Association: Nuclear risks of US war on Iran' },
      { type: 'news', url: 'https://www.aljazeera.com/news/liveblog/2026/3/21/iran-war-live-trump-says-other-nations-have-to-protect-hormuz-from-iran', label: 'Al Jazeera: Day 22 live updates' }
    ]
  },
  {
    id: 'diego-garcia-missile',
    date: '2026-03-21',
    time: '05:30',
    title: 'Iran fires missiles at Diego Garcia — 4,000 km range demonstrated',
    category: 'escalation',
    description: 'Iran fires two intermediate-range ballistic missiles (IRBMs) at the joint US-UK military base on Diego Garcia in the Indian Ocean — 4,000 km from Iranian territory. One missile malfunctions in flight. The other is intercepted by a US destroyer\'s SM-3 system. No damage to the base. But the strategic significance is immense: Iran\'s previously assessed operational range was 2,000-3,000 km. The demonstrated 4,000+ km range theoretically places European capitals within reach. UK Ministry of Defence condemns Iran\'s "reckless attacks." Iran\'s FM had previously warned British assets are "legitimate targets" after UK authorized US use of its bases.',
    lat: -7.3195,
    lng: 72.4229,
    zoom: 6,
    sourceUrl: 'https://www.cnbc.com/2026/03/21/iran-targeted-but-did-not-hit-diego-garcia-base-with-missiles-wsj.html',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=ETe0ftnltG8', label: 'Iran Natanz struck, Diego Garcia targeted' },
      { type: 'news', url: 'https://thehill.com/policy/international/5794306-iran-launches-missiles-diego-garcia/', label: 'The Hill: Iran fires missiles toward Diego Garcia' },
      { type: 'news', url: 'https://theaviationist.com/2026/03/21/iran-fires-two-intermediate-range-ballistic-missiles-at-diego-garcia-base/', label: 'The Aviationist: Iran fires two IRBMs at Diego Garcia' },
      { type: 'news', url: 'https://www.itv.com/news/2026-03-21/missiles-fired-at-diego-garcia-after-uk-lets-us-use-bases-for-hormuz-strikes', label: 'ITV: MoD condemns Iran\'s reckless attacks on Diego Garcia' },
      { type: 'news', url: 'https://www.aa.com.tr/en/middle-east/iran-fired-ballistic-missiles-at-us-uk-base-in-indian-ocean-report/3873597', label: 'Anadolu: Iran fired ballistic missiles at US-UK Indian Ocean base' },
      { type: 'news', url: 'https://www.jpost.com/middle-east/iran-news/article-890690', label: 'JPost: Iran fires two missiles beyond known range' }
    ]
  },
  {
    id: 'iran-70th-wave',
    date: '2026-03-21',
    time: '08:00',
    title: 'Iran\'s 70th wave — 55+ targets hit across 5 US bases',
    category: 'retaliation',
    description: 'IRGC announces the 70th wave of Operation True Promise 4, targeting 55+ locations across the region. Five US military bases hit simultaneously: Prince Sultan Air Base (Saudi Arabia), Al Dhafra (UAE), Ali Al Salem (Kuwait), Erbil (Iraq), and US Fifth Fleet HQ in Bahrain. Emad, Qiam-1 missiles and attack drones used against US bases. Khaibar Shikan and Qadr missiles fired at Haifa, Tel Aviv, Hadera, and other Israeli cities. Saudi air defenses shoot down 47 drones including 38 in a 3-hour window. IRGC describes strategy as "gradual attrition." Despite US claims Iran has lost 90% of missile capability, the pace of attacks hasn\'t slowed.',
    casualties: { killed: 8, injured: 45, source: 'Al Jazeera / regional media' },
    lat: 26.2,
    lng: 50.6,
    zoom: 5,
    sourceUrl: 'https://news.cgtn.com/news/2026-03-21/Iran-launches-70th-wave-of-strikes-1LGKjb9Qudi/p.html',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=9aTRlZKeJKo', label: 'Iran war strikes — fact check and footage' },
      { type: 'news', url: 'https://www.tribuneindia.com/news/world/irgc-says-70th-wave-of-counter-attacks-launched-5-us-military-installations-targeted/', label: 'Tribune India: IRGC says 70th wave launched, 5 US bases targeted' },
      { type: 'news', url: 'https://en.mehrnews.com/news/242791/Iran-conducts-70th-wave-of-Operation-True-Promise-4', label: 'Mehr News: Iran conducts 70th wave of Operation True Promise 4' },
      { type: 'news', url: 'https://www.aljazeera.com/news/2026/3/21/iran-war-what-is-happening-on-day-22-of-us-israel-attacks', label: 'Al Jazeera: Day 22 — what is happening' }
    ]
  },
  {
    id: 'iran-sanctions-waiver',
    date: '2026-03-21',
    time: '10:00',
    title: 'US lifts sanctions on 140M barrels of Iranian oil at sea',
    category: 'diplomatic',
    description: 'Treasury Department issues a 30-day sanctions waiver allowing purchase of 140 million barrels of Iranian crude oil already loaded on vessels at sea — approximately 1.5 days of global consumption. The move aims to ease oil prices (Brent at $112/barrel, highest since war began). Critics note the absurdity: the US is simultaneously bombing Iran and buying its oil. The waiver only covers barrels already at sea, not new production. Oil settles at $110/barrel on the news. Goldman Sachs warns oil will stay above $100 through 2027.',
    lat: 26.5,
    lng: 56.0,
    zoom: 6,
    sourceUrl: 'https://www.washingtonpost.com/business/2026/03/20/iran-oil-sanctions-trump/',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=JDAMLl5DWOo', label: 'IEA urges oil demand cuts amid Iran crisis' },
      { type: 'news', url: 'https://www.cnbc.com/2026/03/20/us-issues-30-day-sanctions-waiver-for-sale-of-iranian-oil-at-sea.html', label: 'CNBC: US issues 30-day sanctions waiver for Iranian oil' },
      { type: 'news', url: 'https://www.nbcnews.com/world/iran/us-eases-iranian-oil-sanctions-scramble-contain-energy-prices-handing-rcna264546', label: 'NBC: US eases Iranian oil sanctions to contain energy prices' },
      { type: 'news', url: 'https://www.cbsnews.com/news/trump-administration-temporarily-lifts-sanctions-on-iranian-oil-at-sea/', label: 'CBS: Trump temporarily lifts sanctions on Iranian oil at sea' },
      { type: 'news', url: 'https://thehill.com/policy/energy-environment/5794259-trump-lifts-iranian-oil-sanctions/', label: 'The Hill: US lifts sanctions on Iranian oil stranded at sea' }
    ]
  },
  {
    id: 'iran-threatens-tourist-sites',
    date: '2026-03-21',
    time: '12:00',
    title: 'Iran threatens tourist sites worldwide — "parks and resorts won\'t be safe"',
    category: 'escalation',
    description: 'General Abolfazl Shekarchi, Iran\'s top military spokesman, warns that "parks, recreational areas and tourist destinations" worldwide "won\'t be safe" for Iran\'s enemies. The threat signals a potential shift from conventional military retaliation to asymmetric global threats — echoing Iran\'s pre-war network of proxy cells and sleeper agents. Separately, IRGC spokesman insists Iran is "producing missiles even during war conditions" despite US claims that Iranian missile capacity is down 90%. The contradictory claims make damage assessment nearly impossible. Travel advisories updated across Europe and Asia.',
    lat: 35.69,
    lng: 51.39,
    zoom: 4,
    sourceUrl: 'https://www.pbs.org/newshour/world/iran-threatens-to-target-tourism-sites-worldwide-and-says-its-still-building-missiles-nearly-3-weeks-into-war',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=E5lurG0JbWM', label: 'Middle East crisis and global tourism threat' },
      { type: 'news', url: 'https://thehill.com/policy/international/5793186-iran-threats-world-tourism-sites-us-israel/', label: 'The Hill: Iran threatens to target global tourist sites' },
      { type: 'news', url: 'https://www.theglobeandmail.com/business/article-iran-us-israel-war-kuwait-attacks/', label: 'Globe and Mail: Iran threatens world tourist sites' },
      { type: 'news', url: 'https://www.turkiyetoday.com/region/iran-threatens-global-tourist-sites-warns-of-zero-restraint-amid-escalation-3216606/', label: 'Turkiye Today: Iran warns of zero restraint' },
      { type: 'news', url: 'https://www.timesofisrael.com/iran-threatens-to-target-tourist-recreational-sites-worldwide-as-it-keeps-up-attacks-on-gulf/', label: 'Times of Israel: Iran threatens tourist sites worldwide' }
    ]
  },
  {
    id: 'mojtaba-khamenei-mystery',
    date: '2026-03-21',
    time: '14:00',
    title: 'CIA hunting for Iran\'s invisible Supreme Leader — Mojtaba never seen in public',
    category: 'diplomatic',
    description: 'Axios reports the CIA is actively searching for signs of Iran\'s new Supreme Leader Mojtaba Khamenei, who has not appeared in public since being named successor after his father was killed in the opening strikes on Feb 28. His Nowruz message was delivered only as a written statement read on television — no video, no audio. He wrote: "A fracture has emerged in the enemy" and declared Iran dealt a "dizzying blow." Iran\'s entire war is being directed by a leader no one has seen. Questions mount: Is he alive? Is he in a bunker? Is someone else actually running the war? The intelligence vacuum is fueling wild speculation across Iranian exile media.',
    lat: 35.69,
    lng: 51.39,
    zoom: 8,
    sourceUrl: 'https://www.axios.com/2026/03/21/mojtaba-khamenei-iran-leader-where',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=WO4w6krbRFc', label: 'What does Mojtaba Khamenei\'s appointment mean?' },
      { type: 'news', url: 'https://www.cnn.com/2026/03/12/middleeast/mojtaba-khamenei-iran-first-speech-intl', label: 'CNN: Mojtaba Khamenei\'s first purported statement' },
      { type: 'news', url: 'https://www.iranintl.com/en/202603125349', label: 'Iran International: Iran\'s unseen new leader issues first message in writing' },
      { type: 'news', url: 'https://www.euronews.com/2026/03/16/still-no-mojtaba-iran-war-enters-third-week-amid-leadership-crisis-as-norwuz-looms', label: 'Euronews: Still no Mojtaba — leadership crisis deepens' },
      { type: 'news', url: 'https://www.france24.com/en/asia-pacific/20260320-supreme-leader-says-iran-dealt-enemies-dizzying-blow', label: 'France 24: Supreme Leader says Iran dealt enemies a dizzying blow' }
    ]
  },
  {
    id: 'oil-110-war-week-4',
    date: '2026-03-21',
    time: '16:00',
    title: 'War enters week 4 — oil at $110, Hormuz traffic down 70%, 200+ US wounded',
    category: 'escalation',
    description: 'Day 22 status: Brent crude at $110/barrel (up from $70 pre-war). Strait of Hormuz tanker traffic down ~70% with 150+ ships anchored outside. 21 confirmed attacks on merchant vessels since March 1. US troop count in region surpasses 50,000. US casualties: 13 killed (7 by enemy fire), 200+ wounded across 7 countries. Iran official death toll: 1,444 (but NGO HRANA documented 3,114 by March 17, including 1,354 civilians and 204 children). No ceasefire in sight — Trump: "You don\'t do a ceasefire when you\'re literally obliterating the other side." NPR: "Iran war enters fourth week with no clear end."',
    casualties: { killed: 0, source: 'Cumulative status — see individual events' },
    lat: 26.56,
    lng: 56.25,
    zoom: 5,
    sourceUrl: 'https://www.npr.org/2026/03/21/nx-s1-5755539/iran-war-fourth-week',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=v-C1M39YUOY', label: 'War in Iran — European petrol prices spike' },
      { type: 'news', url: 'https://fortune.com/article/price-of-oil-03-20-2026/', label: 'Fortune: Oil prices March 20-21 — Brent at $110+' },
      { type: 'news', url: 'https://www.aljazeera.com/news/2026/3/21/iran-war-what-is-happening-on-day-22-of-us-israel-attacks', label: 'Al Jazeera: What is happening on Day 22' },
      { type: 'news', url: 'https://en.wikipedia.org/wiki/2026_Strait_of_Hormuz_crisis', label: 'Wikipedia: 2026 Strait of Hormuz crisis' },
      { type: 'news', url: 'https://en.wikipedia.org/wiki/Timeline_of_the_2026_Iran_war', label: 'Wikipedia: Timeline of the 2026 Iran war' }
    ]
  },
  // ── Mar 19-21: Gulf infrastructure strikes + US troop buildup ──
  {
    id: 'south-pars-strike',
    date: '2026-03-19',
    time: '06:00',
    title: 'Israel strikes Iran\'s South Pars gas field — Iran vows "energy war" retaliation',
    category: 'military_strike',
    description: 'Israeli F-35s strike South Pars, the world\'s largest natural gas field shared by Iran and Qatar. Iran calls it an act of "energy terrorism" and vows to make Gulf states pay for hosting US forces. The strike triggers a cascade: Iran begins retaliatory strikes on Gulf energy infrastructure — Kuwait, Qatar, UAE all targeted within 48 hours. Global LNG prices spike 40% overnight.',
    lat: 27.5,
    lng: 52.6,
    zoom: 7,
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/19/israel-strikes-irans-south-pars-gas-field',
    mediaUrls: [
      { type: 'news', url: 'https://www.reuters.com/business/energy/irans-south-pars-gas-field-strike-global-lng-impact-2026-03-19/', label: 'Reuters: Global LNG impact' }
    ]
  },
  {
    id: 'kuwait-refinery-strike',
    date: '2026-03-19',
    time: '22:00',
    title: 'Iran drones hit Kuwait\'s Mina al-Ahmadi refinery — 730K BPD facility ablaze',
    category: 'retaliation',
    description: 'Two waves of Iranian Shahed drones strike Kuwait\'s Mina al-Ahmadi refinery, one of the Middle East\'s largest at 730,000 barrels/day capacity. Multiple processing units catch fire. Kuwait — which has tried to stay neutral — is dragged into the war. Iran warns any Gulf state hosting US forces is a legitimate target. A second wave hits the refinery again on March 20, causing further damage. Kuwait scrambles to bring online backup capacity but faces weeks of reduced output.',
    casualties: { killed: 3, injured: 17 },
    lat: 29.06,
    lng: 48.15,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/20/kuwait-oil-refinery-hit-again-as-iran-targets-gulf-energy-infrastructure',
    mediaUrls: [
      { type: 'news', url: 'https://www.reuters.com/business/energy/kuwait-mina-al-ahmadi-refinery-fire-iran-drone-2026-03-19/', label: 'Reuters: Mina al-Ahmadi ablaze' }
    ]
  },
  {
    id: 'ras-laffan-destroyed',
    date: '2026-03-20',
    time: '04:00',
    title: 'Qatar\'s Ras Laffan LNG terminal "severely damaged" — 17% of global LNG gone',
    category: 'escalation',
    description: 'Iranian ballistic missiles and cruise missiles hit Qatar\'s Ras Laffan Industrial City, the world\'s largest LNG export facility. QatarEnergy confirms "severe damage" to multiple liquefaction trains. Repairs could take 3-5 years and cost $20 billion annually in lost revenue. Europe and Asia, already scrambling for gas after Russian cutoffs, face a winter energy crisis. Natural gas futures in Europe surge to all-time highs. Qatar, which hosts the largest US base in the Middle East (Al Udeid), is now paying the price.',
    casualties: { killed: 12, injured: 45 },
    lat: 25.93,
    lng: 51.53,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/20/qatar-ras-laffan-lng-terminal-struck-by-iranian-missiles',
    mediaUrls: [
      { type: 'news', url: 'https://www.ft.com/content/ras-laffan-lng-global-impact-2026', label: 'FT: Global LNG crisis deepens' }
    ]
  },
  {
    id: 'abu-dhabi-gas-strike',
    date: '2026-03-20',
    time: '08:00',
    title: 'Iran targets Abu Dhabi gas operations — UAE drawn into conflict',
    category: 'retaliation',
    description: 'Iranian missiles target UAE gas processing facilities near Abu Dhabi. The UAE has quietly hosted US military operations from Al Dhafra Air Base. Iran\'s message is clear: no Gulf state is safe. UAE activates THAAD missile defense and intercepts several incoming missiles, but some get through. Abu Dhabi stock exchange drops 8% in a single session. The UAE recalls its ambassador from Tehran.',
    casualties: { killed: 6, injured: 23 },
    lat: 24.45,
    lng: 54.65,
    zoom: 8,
    sourceUrl: 'https://www.bbc.com/news/world-middle-east-abu-dhabi-iran-strike-2026',
    mediaUrls: []
  },
  {
    id: 'marines-deploy-2500',
    date: '2026-03-20',
    time: '12:00',
    title: '2,500 Marines deploy to Gulf — 82nd Airborne on standby for "rapid insertion"',
    category: 'escalation',
    description: 'The 11th Marine Expeditionary Unit (2,200+ Marines) departs San Diego for the Persian Gulf. A second MEU is redirected from Indo-Pacific. Total US forces in region now exceed 50,000. Separately, the 82nd Airborne Division\'s training exercises are abruptly canceled — the Army\'s Global Response Force is being prepared for "rapid insertion, air-assault operations, and expeditionary combat." Pentagon insists this is "maximum optionality, not a decision." But CBS reports the Pentagon has made "detailed preparations" for deploying ground forces into Iran.',
    lat: 26.0,
    lng: 52.0,
    zoom: 5,
    sourceUrl: 'https://www.military.com/daily-news/headlines/2026/03/20/us-send-another-2500-marines-ground-option-emerges-iran-war.html',
    mediaUrls: [
      { type: 'news', url: 'https://www.cbsnews.com/news/trump-administration-iran-ground-troop-preparations/', label: 'CBS: Ground troop preparations' },
      { type: 'news', url: 'https://www.washingtonpost.com/national-security/2026/03/06/army-82nd-airborne-iran/', label: 'WaPo: 82nd Airborne moves' },
      { type: 'news', url: 'https://www.usnews.com/news/world/articles/2026-03-20/us-to-deploy-of-thousands-of-additional-troops-to-the-middle-east-officials-say', label: 'US News: Thousands more troops' }
    ]
  },
  {
    id: 'kharg-island-ground-plan',
    date: '2026-03-20',
    time: '18:00',
    title: 'Axios: Trump mulling Kharg Island ground takeover to force Hormuz open',
    category: 'escalation',
    description: 'Axios reports the Trump administration is considering a ground operation to seize Iran\'s Kharg Island — which handles 90% of Iran\'s oil exports. The March 13-14 airstrikes that "totally demolished" the island were preparation to degrade Iran\'s defenses. A ground takeover would give the US physical control of Iran\'s economic lifeline and leverage to force Hormuz open. Military planners warn it would require holding the island indefinitely and defending it against constant missile/drone attack. Ex-Army intel analyst on Democracy Now: "This could be a suicide mission."',
    lat: 29.23,
    lng: 50.32,
    zoom: 10,
    sourceUrl: 'https://www.axios.com/2026/03/20/iran-invasion-kharg-island-strait-hormuz',
    mediaUrls: [
      { type: 'news', url: 'https://www.cnn.com/2026/03/21/politics/trump-iran-war-decision-us-troops', label: 'CNN: Trump\'s most difficult war decision' }
    ]
  },
  {
    id: 'arad-dimona-strike',
    date: '2026-03-21',
    time: '05:00',
    title: 'Iran strikes Arad near Israel\'s Dimona nuclear site — 90+ wounded',
    category: 'retaliation',
    description: 'Iranian ballistic missiles strike the Israeli town of Arad, just 30km from the Dimona nuclear facility — Israel\'s secretive nuclear weapons site. At least 90 wounded (4 serious, 12 moderate). Multiple towns in the Negev hit. Iran\'s message is unmistakable: "You bomb our nuclear sites, we\'ll hit yours." Netanyahu threatens "devastating response." The strike demonstrates Iran can threaten Israel\'s nuclear infrastructure with precision missiles, raising the stakes to unprecedented levels.',
    casualties: { killed: 0, injured: 90 },
    lat: 31.26,
    lng: 35.21,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/21/iran-strikes-towns-near-israels-nuclear-site-in-escalating-tit-for-tat',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=iVHd0SUN7fE', label: 'BBC: Iranian missile strikes near Israeli nuclear facility' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=sriAOsBuoiw', label: 'Al Jazeera: Netanyahu threatens more attacks after Arad strike' },
      { type: 'news', url: 'https://www.bbc.com/news/world-middle-east-arad-dimona-strike-2026', label: 'BBC: Missiles near Dimona' }
    ]
  },
  {
    id: 'trump-48hr-ultimatum',
    date: '2026-03-21',
    time: '14:00',
    title: 'Trump issues 48-hour ultimatum: "Reopen Hormuz or we obliterate your power grid"',
    category: 'escalation',
    description: 'President Trump publicly threatens to "hit and obliterate" Iran\'s entire power plant network if the Strait of Hormuz is not fully reopened within 48 hours. Iran\'s power grid serves 85 million people — destroying it would collapse hospitals, water treatment, food storage, and telecommunications across the country. Iran\'s foreign minister responds: "We are confident we can counter any escalation." The ultimatum sets a clock: if Iran doesn\'t comply by March 23, the war expands dramatically. European allies call the threat "disproportionate and reckless." Oil futures spike on the threat.',
    lat: 26.56,
    lng: 56.25,
    zoom: 6,
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/21/trump-48-hour-ultimatum-iran-hormuz',
    mediaUrls: [
      { type: 'news', url: 'https://www.nbcnews.com/world/iran/iran-foreign-minister-interview-rcna261920', label: 'NBC: Iran FM confident on counter' }
    ]
  },
  {
    id: 'tehran-nowruz-strikes',
    date: '2026-03-21',
    time: '03:00',
    title: 'Israel bombs Tehran during Nowruz — strikes as Iranians celebrate new year',
    category: 'military_strike',
    description: 'Israeli airstrikes hit targets in and around Tehran on Nowruz (Persian New Year) — the most sacred holiday in Iranian culture. The timing is seen as deliberate humiliation. Strikes target IRGC command centers and missile storage sites. Iran\'s state media broadcasts footage of explosions over Tehran\'s skyline as families gathered for Haft-sin celebrations. The propaganda value for Iran\'s hardliners is enormous — "They bomb us while our children celebrate." International condemnation from even US allies.',
    casualties: { killed: 28, injured: 85 },
    lat: 35.69,
    lng: 51.39,
    zoom: 9,
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/21/israel-strikes-tehran-nowruz',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=NFpcPL5IV3Q', label: 'France 24: Iran strikes Israeli nuclear town in retaliation' }
    ]
  },
  {
    id: 'saudi-expels-iran-attache',
    date: '2026-03-21',
    time: '10:00',
    title: 'Saudi Arabia expels Iranian military attache — diplomatic ties severed',
    category: 'diplomatic',
    description: 'Saudi Arabia expels Iran\'s military attache and four staff members, effectively severing military diplomatic ties restored just 3 years ago under the China-brokered 2023 rapprochement. The move signals Saudi Arabia is abandoning its neutral stance. With Kuwait and UAE already hit by Iranian strikes, the Gulf Cooperation Council is fracturing — some members want to join the US coalition, others want to stay out. Saudi defense forces go on maximum alert. Abqaiq and Ras Tanura refineries get additional Patriot missile battery coverage.',
    lat: 24.71,
    lng: 46.68,
    zoom: 6,
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/21/saudi-arabia-expels-iranian-military-attache',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=FbawsoFc0fM', label: 'Al Jazeera: Saudi Arabia expels Iranian military attache' }
    ]
  },
  {
    id: 'trump-winding-down-mar21',
    date: '2026-03-21',
    time: '17:00',
    title: 'Trump says US considering "winding down" Iran war as Tehran fires long-range missiles',
    category: 'diplomatic',
    description: 'President Trump tells reporters the US is considering "winding down" military operations against Iran, even as Iran demonstrates new long-range missile capabilities. The statement comes hours after Iran fired IRBMs at Diego Garcia and launched its 70th wave of attacks. Critics call the messaging incoherent — threatening to obliterate Iran\'s power grid in the morning, floating de-escalation by evening. Markets react with cautious optimism, oil dips briefly below $110. Iran\'s foreign ministry dismisses the overture as "American theater" while continuing attacks.',
    lat: 38.8977,
    lng: -77.0365,
    zoom: 5,
    sourceUrl: 'https://www.reuters.com/world/middle-east/trump-us-considering-winding-down-iran-war-2026-03-21/',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=1yuoFfQhEdA', label: 'Reuters: Trump says considering winding down Iran war' }
    ]
  },
  {
    id: 'un-lebanon-classroom-casualties',
    date: '2026-03-21',
    time: '13:00',
    title: 'UN: equivalent of "one classroom of children" killed or wounded daily in Lebanon',
    category: 'humanitarian',
    description: 'UN News reports that the equivalent of "one classroom of children" is being killed or wounded every day in Lebanon as the conflict continues to spill across borders. The report coincides with renewed strikes on Iran\'s nuclear facilities. UN agencies warn that humanitarian access remains severely restricted across multiple conflict zones. The WHO reports 67% of Lebanon\'s hospitals are operating at reduced capacity due to fuel shortages linked to the Gulf energy crisis.',
    lat: 33.89,
    lng: 35.50,
    zoom: 8,
    sourceUrl: 'https://news.un.org/en/story/2026/03/1162345',
    mediaUrls: []
  },
  {
    id: 'war-co2-emissions-5m-tonnes',
    date: '2026-03-21',
    time: '15:00',
    title: '5 million tonnes of CO2 emitted in just 14 days of US war on Iran',
    category: 'escalation',
    description: 'The Guardian reports analysis showing the US-Iran war has produced an estimated 5 million tonnes of CO2 in its first 14 days — from burning oil infrastructure, military operations, ship rerouting, and destroyed gas fields. The figure exceeds the annual emissions of some small nations. The burning South Pars gas field alone is estimated at thousands of tonnes per day. Environmental groups call it "an ecological catastrophe on top of a humanitarian one." The analysis draws on satellite fire radiative power data and IPCC emission factors.',
    lat: 27.5,
    lng: 52.0,
    zoom: 5,
    sourceUrl: 'https://www.theguardian.com/environment/2026/mar/21/5m-tonnes-co2-emitted-14-days-us-war-iran',
    mediaUrls: []
  },

  // ═══ MARCH 22 — Day 23: Iran responds to Trump ultimatum ═══

  {
    id: 'iran-hormuz-water-threat',
    date: '2026-03-22',
    time: '06:00',
    title: 'Iran vows to "completely close" Hormuz and destroy water & energy facilities across region',
    category: 'escalation',
    description: 'Iran responds to Trump\'s 48-hour power grid ultimatum with an unprecedented counter-threat: if the US or Israel attacks Iranian power plants, Iran will "completely close" the Strait of Hormuz and systematically destroy water desalination plants, power stations, and energy infrastructure across the Gulf. The threat targets the region\'s most critical civilian infrastructure — Gulf states depend on desalinated water for 90% of drinking water. Iran\'s IRGC Navy commander says mines are already in position. The escalation raises the stakes from energy disruption to potential humanitarian catastrophe affecting tens of millions of civilians across the Gulf.',
    lat: 26.56,
    lng: 56.25,
    zoom: 6,
    sourceUrl: 'https://www.theguardian.com/world/2026/mar/22/iran-vows-destroy-water-energy-facilities-us-attacks',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=7lNi2O6dej8', label: 'Guardian: Iran vows to destroy water & energy facilities' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=HVi0Mb_oeMk', label: 'Al Jazeera: Tehran vows to completely close Hormuz' },
      { type: 'news', url: 'https://www.pbs.org/newshour/world/iran-threatens-close-strait-of-hormuz-power-plants-trump-deadline', label: 'PBS: Iran threatens Hormuz closure after Trump deadline' }
    ]
  },
  {
    id: 'iran-strikes-israel-day23',
    date: '2026-03-22',
    time: '09:00',
    title: 'Multiple Iranian missile strikes hit cities across Israel — day 23',
    category: 'retaliation',
    description: 'Iran launches a new wave of ballistic missile strikes targeting multiple Israeli cities simultaneously. The attacks come as the 48-hour ultimatum clock ticks down. Israeli air defenses intercept most incoming missiles but several get through, causing damage in residential areas. Iran\'s strategy of sustained daily strikes is straining Israel\'s Iron Dome and Arrow interceptor stockpiles. The IDF reports it has intercepted over 1,200 projectiles since the war began but admits the pace is "challenging supply chains."',
    lat: 32.07,
    lng: 34.78,
    zoom: 8,
    sourceUrl: 'https://www.cnn.com/2026/03/22/middleeast/multiple-iranian-strikes-israel',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=m23aWmFGhQ0', label: 'CNN: Day 23 — Iran responds to Trump threat, strikes on Israel' }
    ]
  },
  {
    id: 'starmer-trump-hormuz-call',
    date: '2026-03-22',
    time: '14:00',
    title: 'UK PM Starmer and Trump discuss "urgent need" to reopen Strait of Hormuz',
    category: 'diplomatic',
    description: 'UK Prime Minister Keir Starmer speaks with President Trump about the "urgent need" to reopen the Strait of Hormuz as the closure enters its second week. Europe is feeling the pain — natural gas prices have tripled, and the UK faces potential heating fuel shortages before summer. Starmer stops short of committing British forces to a Hormuz clearance operation but agrees to expand Royal Navy patrols. The call highlights the war\'s global economic reach — even nations not directly involved are being dragged into the crisis through energy markets.',
    lat: 51.5074,
    lng: -0.1278,
    zoom: 5,
    sourceUrl: 'https://www.bbc.com/news/uk-politics-starmer-trump-hormuz-2026',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=8I_hxmljbCs', label: 'BBC: Starmer and Trump discuss reopening Hormuz' }
    ]
  },
  {
    id: 'hormuz-ground-battle-specter',
    date: '2026-03-22',
    time: '16:00',
    title: 'WaPo: US troop build-up raises specter of ground battle for Strait of Hormuz',
    category: 'escalation',
    description: 'The Washington Post reports that Trump\'s threats and the growing US military build-up in the Gulf — now over 45,000 troops with 5 carrier groups — are raising the specter of a ground operation to forcibly reopen the Strait of Hormuz. Pentagon planners are reportedly drawing up options for seizing Iranian islands in the strait, including Qeshm and Larak. Military analysts warn such an operation would be "the most dangerous amphibious assault since Inchon" given Iran\'s extensive coastal missile batteries, mines, and fast-attack boats. The 48-hour ultimatum expires tomorrow.',
    lat: 26.60,
    lng: 56.30,
    zoom: 7,
    sourceUrl: 'https://www.washingtonpost.com/national-security/2026/03/22/trump-hormuz-ground-battle-troops/',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=cpNZkTQ7_8o', label: 'WaPo: Trump threats raise specter of battle for Hormuz' }
    ]
  }
];

// ═══ HELPER FUNCTIONS ═══

export function getEventsUpTo(date: string): ConflictEvent[] {
  return conflictEvents.filter((e) => e.date <= date);
}

// Oct 7 Hamas attack event IDs (attacks ON Israel, not Israeli response)
const HAMAS_ATTACK_IDS = new Set([
  'oct7-rockets', 'oct7-nova-festival', 'oct7-beeri', 'oct7-kfar-aza',
  'oct7-nir-oz', 'oct7-nahal-oz', 'oct7-sderot', 'oct7-other-communities',
]);

export function getCasualtiesUpTo(date: string) {
  const events = getEventsUpTo(date);
  let totalKilled = 0;
  let totalInjured = 0;
  let totalDisplaced = 0;
  let totalKilledAdjusted = 0;
  let totalChildren = 0;
  const byParty: Record<string, { killed: number; injured: number; displaced: number }> = {};

  for (const event of events) {
    if (!event.casualties) continue;
    const k = event.casualties.killed || 0;
    const inj = event.casualties.injured || 0;
    const disp = event.casualties.displaced || 0;
    const adj = event.casualties.killedAdjusted || 0;
    const children = event.casualties.children || 0;
    totalKilled += k;
    totalInjured += inj;
    totalDisplaced += disp;
    totalChildren += children;
    totalKilledAdjusted += adj > 0 ? adj : k;

    // Attribute casualties to responsible military force
    let party = 'Other Forces';

    if (HAMAS_ATTACK_IDS.has(event.id)) {
      party = 'Hamas — Oct 7 Attack';
    } else if (event.lat && event.lng) {
      // Lebanon first — Beirut is at lng ~35.5 which overlaps Israel's range
      if (event.lat >= 33.05 && event.lat < 34.8 && event.lng > 34.8 && event.lng < 36.8) party = 'Israeli Military — Lebanon';
      else if (event.lat >= 29 && event.lat < 33.35 && event.lng > 34 && event.lng < 36) party = 'Israeli Military — Gaza & West Bank';
      else if (event.lat > 32 && event.lat < 38 && event.lng >= 36 && event.lng < 42.5) party = 'Israeli Military — Syria';
      else if (event.lat > 25 && event.lat < 37 && event.lng > 44 && event.lng < 65) party = 'Israeli / US Coalition — Iran';
      else if (event.lat > 24 && event.lat < 30 && event.lng > 46 && event.lng < 57) party = 'Iranian Military — Gulf States';
      else if (event.lat > 10 && event.lat < 20 && event.lng > 42 && event.lng < 46) party = 'US / UK Coalition — Yemen';
    }

    if (!byParty[party]) byParty[party] = { killed: 0, injured: 0, displaced: 0 };
    byParty[party].killed += k;
    byParty[party].injured += inj;
    byParty[party].displaced += disp;
  }

  return { totalKilled, totalInjured, totalDisplaced, totalKilledAdjusted, totalChildren, byParty };
}

export function getVisibleFacilityIds(date: string): Set<string> {
  const ids = new Set<string>();
  for (const event of conflictEvents) {
    if (event.date <= date && event.facilityId) {
      ids.add(event.facilityId);
    }
  }
  return ids;
}

export function getTimelineDates(): string[] {
  const dates = Array.from(new Set(conflictEvents.map((e) => e.date)));
  return dates.sort();
}

// ═══ NUCLEAR THREAT TRACKER ═══
// Progressive nuclear status synced to timeline.
export interface NuclearStatus {
  facilitiesTargeted: number;
  facilitiesDestroyed: number;
  enrichmentPct: number;   // Iran's enrichment capability remaining (0-100)
  radiationRisk: 'none' | 'low' | 'elevated' | 'high';
  label: string;
}

interface NuclearEvent {
  date: string;
  status: NuclearStatus;
}

const NUCLEAR_TIMELINE: NuclearEvent[] = [
  {
    date: '2024-04-19',
    status: { facilitiesTargeted: 1, facilitiesDestroyed: 0, enrichmentPct: 100, radiationRisk: 'none', label: 'Israel strikes near Isfahan — warning shot' }
  },
  {
    date: '2026-03-01',
    status: { facilitiesTargeted: 2, facilitiesDestroyed: 0, enrichmentPct: 95, radiationRisk: 'none', label: 'War begins — Natanz tunnel entrances hit' }
  },
  {
    date: '2026-03-06',
    status: { facilitiesTargeted: 3, facilitiesDestroyed: 1, enrichmentPct: 60, radiationRisk: 'low', label: 'Isfahan & Natanz heavily damaged' }
  },
  {
    date: '2026-03-09',
    status: { facilitiesTargeted: 4, facilitiesDestroyed: 2, enrichmentPct: 40, radiationRisk: 'elevated', label: 'Fordow bunker busters — deep underground hit' }
  },
  {
    date: '2026-03-14',
    status: { facilitiesTargeted: 5, facilitiesDestroyed: 3, enrichmentPct: 25, radiationRisk: 'elevated', label: 'Arak heavy water reactor destroyed' }
  },
  {
    date: '2026-03-21',
    status: { facilitiesTargeted: 6, facilitiesDestroyed: 4, enrichmentPct: 15, radiationRisk: 'high', label: 'Natanz struck again — IAEA warns of nuclear accident risk' }
  },
];

export function getNuclearStatusUpTo(date: string): NuclearStatus | null {
  let latest: NuclearStatus | null = null;
  for (const entry of NUCLEAR_TIMELINE) {
    if (entry.date <= date) latest = entry.status;
  }
  return latest;
}

export function getRecentEventStats(date: string) {
  const events = getEventsUpTo(date);
  const dateMs = new Date(date + 'T23:59:59').getTime();
  const severeCategories = new Set(['escalation', 'retaliation', 'military_strike']);

  let last7 = 0;
  let severeLast30 = 0;

  for (const e of events) {
    const diff = (dateMs - new Date(e.date + 'T00:00:00').getTime()) / 86400000;
    if (diff <= 7) last7++;
    if (diff <= 30 && severeCategories.has(e.category)) severeLast30++;
  }

  return { eventsLast7: last7, severeEventsLast30: severeLast30, totalEvents: events.length };
}
