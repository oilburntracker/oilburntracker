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
    sourceUrl: 'https://en.wikipedia.org/wiki/October_2023_Israel%E2%80%93Hezbollah_fire_exchanges'
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
    sourceUrl: 'https://www.bbc.com/news/world-middle-east-67053011'
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
      { type: 'news', url: 'https://www.pbs.org/newshour/world/israeli-defense-minister-orders-complete-siege-on-gaza-after-hamas-surprise-attack', label: 'PBS: No power, food or fuel' }
    ]
  },
  {
    id: 'oct10-jabalia-camp',
    date: '2023-10-10',
    title: 'Jabalia refugee camp hit — 6,000 bombs in 6 days',
    category: 'military_strike',
    description: 'Israel drops 6,000 bombs on Gaza in the first 6 days — more than the US dropped on Afghanistan in an entire year. Jabalia, one of the most densely populated places on Earth, hit repeatedly. Entire city blocks flattened. Families pulled from rubble. By Oct 10: 900+ Palestinians killed including 260+ children. No way out, nowhere to hide.',
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
    sourceUrl: 'https://www.un.org/sexualviolenceinconflict/press-release/mission-report-of-the-office-of-the-srsg-svc-to-israel-and-the-occupied-west-bank/'
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
      { type: 'news', url: 'https://www.aljazeera.com/news/2023/10/18/what-do-we-know-about-the-strike-on-the-hospital-in-gaza', label: 'Al Jazeera: What we know' }
    ]
  },
  {
    id: 'oct15-hind-rajab',
    date: '2023-10-15',
    title: 'Children trapped in cars, under rubble — rescue impossible',
    category: 'humanitarian',
    description: 'Across Gaza, children are dying under rubble with no rescue equipment. Hospitals overwhelmed — operating without anesthesia. Doctors amputating limbs of children with no painkillers. Parents writing children\'s names on their legs so bodies can be identified. 724 children killed in the first 8 days.',
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
    sourceUrl: 'https://www.aljazeera.com/news/2023/10/21/rafah-border-crossing-between-gaza-egypt-opens-for-aid-trucks'
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
    sourceUrl: 'https://www.bbc.com/news/world-middle-east-67542435'
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
    sourceUrl: 'https://news.un.org/en/story/2023/12/1144447'
  },
  {
    id: 'dec7-refaat-alareer',
    date: '2023-12-07',
    title: 'Poet Refaat Alareer killed — "If I Must Die" goes viral',
    category: 'military_strike',
    description: 'Palestinian poet and professor Refaat Alareer (44) killed in airstrike in Shejaiya with his brother, sister, and four nephews. Euro-Med Monitor says he was deliberately targeted — "surgically bombed out of the entire building" after weeks of death threats. His poem "If I Must Die" will be translated into 250+ languages and read at protests worldwide.',
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
    sourceUrl: 'https://www.cnn.com/2023/12/07/middleeast/gaza-israeli-soldiers-detained-men-intl/index.html'
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
    sourceUrl: 'https://www.npr.org/2023/12/12/1218927939/un-general-assembly-gaza-israel-resolution-cease-fire-us'
  },
  {
    id: 'dec15-hostages-white-flag',
    date: '2023-12-15',
    title: 'IDF kills 3 Israeli hostages waving white flag',
    category: 'humanitarian',
    description: 'Three Israeli hostages — Yotam Haim (28), Alon Shamriz (26), Samer Talalka (24) — shot dead by IDF in Shejaiya despite being shirtless, unarmed, waving a white flag. Sniper kills two; third shot 15 minutes later against battalion commander\'s direct order to hold fire. IDF chief admits it violated rules of engagement. Same day: Al Jazeera cameraman Samer Abudaqa killed — left to bleed out for hours as IDF blocks paramedics.',
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
    sourceUrl: 'https://www.aljazeera.com/news/2023/12/21/entire-gaza-population-facing-hunger-crisis-famine-risk-un-backed-report'
  },
  {
    id: 'dec24-christmas-massacre',
    date: '2023-12-24',
    title: 'Christmas Eve massacre — 250 killed across Gaza in 24 hours',
    category: 'military_strike',
    description: 'Israeli warplanes strike three houses in al-Maghazi refugee camp: 106 killed. Gaza MoH: "massacre on a crowded residential square." 250+ Palestinians killed across Gaza in 24 hours — additional mass casualties in Khan Younis, Bureij, Nuseirat. MSF: 209 injured and 131 dead at Al-Aqsa Hospital from Christmas Eve strikes alone.',
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
    sourceUrl: 'https://www.icj-cij.org/case/192'
  },
  {
    id: 'jan29-hind-rajab',
    date: '2024-01-29',
    title: 'Hind Rajab, age 6 — calls for help for hours before being killed',
    category: 'humanitarian',
    description: '6-year-old Hind Rajab calls Palestinian Red Crescent from a car surrounded by dead relatives. She whispers in terror for 3 hours. "I\'m scared. Come take me." An ambulance is dispatched — both paramedics are killed. 12 days later her body is found in the car, riddled with bullets. She becomes a symbol of the war.',
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
    sourceUrl: 'https://www.bbc.com/news/world-middle-east-68852804'
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
    sourceUrl: 'https://www.aljazeera.com/news/2024/4/21/nearly-200-bodies-found-in-mass-grave-at-hospital-in-gazas-khan-younis'
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
      { type: 'news', url: 'https://www.cnn.com/2024/06/09/middleeast/israel-hostage-rescue-gaza-intl-hnk/index.html', label: 'CNN: Hostage rescue and destruction' }
    ]
  },
  {
    id: 'al-mawasi-strike',
    date: '2024-07-13',
    title: 'Israel strikes "safe zone" tent camp — 90+ killed, Hamas commander targeted',
    category: 'military_strike',
    description: 'Airstrike hits tent camp in Al-Mawasi — an area Israel designated as a humanitarian safe zone. 90+ killed, 300+ wounded. Victims were displaced families sleeping in tents. IDF says it targeted Hamas military chief Mohammed Deif (confirmed killed Aug 1). The concept of "safe zones" is dead.',
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
    sourceUrl: 'https://www.amnesty.org/en/latest/news/2024/07/icj-opinion-declaring-israels-occupation-of-palestinian-territories-unlawful-is-historic-vindication-of-palestinians-rights/'
  },
  {
    id: 'houthi-tel-aviv-drone',
    date: '2024-07-19',
    title: 'Houthi drone strikes Tel Aviv — evades all air defenses',
    category: 'escalation',
    description: 'A Houthi "Jaffa" drone (modified Iranian Samad-3) evades Israeli air defenses due to reported human error and strikes an apartment building near the US Embassy on Ben Yehuda Street, Tel Aviv. 1 killed, 10 injured. First successful Houthi attack to reach Tel Aviv. The war is reaching Israel\'s heartland from 2,000 km away.',
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
    sourceUrl: 'https://www.aljazeera.com/news/2024/10/1/israel-says-has-started-targeted-ground-raids-in-lebanon'
  },
  {
    id: 'northern-gaza-siege',
    date: '2024-10-05',
    title: 'Siege of northern Gaza begins — 400,000 trapped',
    category: 'military_strike',
    description: 'IDF reinvades Jabalia, imposes complete siege on northern Gaza. Oct 6: all of northern Gaza declared combat zone, entire population ordered to evacuate. All food aid blocked since Oct 1. Roads destroyed. Pattern matches leaked "Generals\' Plan" to empty northern Gaza. 400,000 civilians trapped.',
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
    sourceUrl: 'https://www.aljazeera.com/news/2024/10/18/hamas-confirms-leader-yahya-sinwar-killed-in-combat-in-gaza-by-israeli-army'
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
    sourceUrl: 'https://www.reuters.com/world/middle-east/israeli-warplanes-carry-out-strikes-iran-israeli-military-says-2024-10-26/'
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
    sourceUrl: 'https://www.cnn.com/2024/10/28/middleeast/unrwa-israel-knesset-vote-ban-palestinians-intl/index.html'
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
    sourceUrl: 'https://www.icc-cpi.int/news/situation-state-palestine-icc-pre-trial-chamber-i-rejects-state-israels-challenges'
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
    sourceUrl: 'https://www.npr.org/2024/11/27/g-s1-36024/israel-lebanon-ceasefire-reaction'
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
    sourceUrl: 'https://www.aljazeera.com/news/2024/12/27/israeli-soldiers-burn-gazas-kamal-adwan-hospital-force-hundreds-to-leave'
  },
  {
    id: 'gaza-end-2024',
    date: '2024-12-31',
    title: 'Gaza 2024: 45,000+ killed, 80% of buildings damaged',
    category: 'humanitarian',
    description: 'By year end: 45,000+ killed (MoH), likely 60,000+ (Lancet). 100,000+ injured. 1.9M displaced — 90% of population. 80% of buildings damaged or destroyed. Every university destroyed. 60% housing uninhabitable. No hospital in northern Gaza. 1,072 IDF soldiers killed. 192 journalists killed — deadliest year for press in modern history.',
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
    sourceUrl: 'https://www.npr.org/2025/01/15/g-s1-42883/ceasefire-israel-hamas-gaza-hostage-release'
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
    sourceUrl: 'https://www.npr.org/2025/01/19/g-s1-43565/gaza-ceasefire-begins-after-delay'
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
    sourceUrl: 'https://www.reuters.com/world/trumps-maximum-pressure-iran-2025-01-20/'
  },
  {
    id: 'jan21-operation-iron-wall',
    date: '2025-01-21',
    title: 'Operation Iron Wall — largest West Bank incursion in 20 years',
    category: 'military_strike',
    description: 'IDF launches "Operation Iron Wall" in Jenin, then Tulkarm, Tubas. Helicopter gunfire, airstrikes, tanks deployed for first time since 2000s. Palestinian Authority participates in joint ops — unprecedented. 126 killed by June, 40,000+ displaced, 850 homes demolished.',
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
    sourceUrl: 'https://www.aljazeera.com/news/2025/1/30/israels-ban-on-unrwa-comes-into-effect-despite-backlash'
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
    sourceUrl: 'https://www.unrwa.org/resources/reports/unrwa-situation-report-186-situation-gaza-strip-and-west-bank-including-east-jerusalem'
  },
  {
    id: 'mar15-operation-rough-rider',
    date: '2025-03-15',
    title: 'US bombs Yemen — Operation Rough Rider against Houthis',
    category: 'military_strike',
    description: 'Trump launches massive air campaign targeting Houthi positions. B-2 stealth bombers deployed. 1,000+ targets struck. Houthis resumed Red Sea attacks after Israel blocked aid. ~300 killed including 25 civilians and 4 children.',
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
    sourceUrl: 'https://www.aljazeera.com/news/2025/6/12/un-nuclear-watchdog-says-iran-non-compliant-of-nuclear-safeguards'
  },
  {
    id: 'jun13-operation-rising-lion',
    date: '2025-06-13',
    title: 'Operation Rising Lion — Israel strikes Iran with 200+ jets',
    category: 'military_strike',
    description: 'Israel launches surprise attack: 200+ fighter jets drop 330+ munitions on ~100 targets. Natanz enrichment facility destroyed (above-ground 60% section). Isfahan, Arak hit. Commandos and Mossad on the ground. IRGC chief Salami, Armed Forces chief Bagheri, and 6+ nuclear scientists assassinated.',
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
    sourceUrl: 'https://www.aljazeera.com/news/2025/6/22/satellite-images-show-damage-from-us-strikes-on-irans-fordow-nuclear-site'
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
    sourceUrl: 'https://www.aljazeera.com/news/2025/6/24/have-israel-and-iran-agreed-to-a-ceasefire-what-we-know'
  },
  {
    id: 'aug10-al-jazeera-journalists',
    date: '2025-08-10',
    title: 'Israel kills Al Jazeera\'s Anas al-Sharif — deadliest press attack',
    category: 'military_strike',
    description: 'IDF strikes press tent near Al-Shifa. 4 Al Jazeera staff killed including Anas al-Sharif (2M followers), plus 2 freelancers — 6 journalists total. Israel claims he headed Hamas cell; Al Jazeera and CPJ call it "completely fabricated." Brings journalist toll to 192. The deadliest single attack on press in the war.',
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
    sourceUrl: 'https://www.ohchr.org/en/press-releases/2025/09/israel-has-committed-genocide-gaza-strip-un-commission-finds'
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
    sourceUrl: 'https://news.usni.org/2025/11/17/iran-strait-of-hormuz-tanker-seizure-violates-international-law-centcom-says'
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
  }
];

// ═══ HELPER FUNCTIONS ═══

export function getEventsUpTo(date: string): ConflictEvent[] {
  return conflictEvents.filter((e) => e.date <= date);
}

export function getCasualtiesUpTo(date: string) {
  const events = getEventsUpTo(date);
  let totalKilled = 0;
  let totalInjured = 0;
  let totalDisplaced = 0;
  let totalKilledAdjusted = 0;
  let totalChildren = 0;
  const byRegion: Record<string, { killed: number; injured: number; displaced: number }> = {};

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

    let region = 'Other';
    if (event.lat) {
      if (event.lat > 30 && event.lng && event.lng > 33 && event.lng < 36) region = 'Israel/Palestine';
      else if (event.lat > 33 && event.lng && event.lng > 35 && event.lng < 37) region = 'Lebanon';
      else if (event.lat > 25 && event.lat < 37 && event.lng && event.lng > 44 && event.lng < 65) region = 'Iran';
      else if (event.lat > 24 && event.lat < 30 && event.lng && event.lng > 46 && event.lng < 57) region = 'Gulf States';
      else if (event.lat > 10 && event.lat < 20 && event.lng && event.lng > 42 && event.lng < 46) region = 'Yemen/Red Sea';
    }

    if (!byRegion[region]) byRegion[region] = { killed: 0, injured: 0, displaced: 0 };
    byRegion[region].killed += k;
    byRegion[region].injured += inj;
    byRegion[region].displaced += disp;
  }

  return { totalKilled, totalInjured, totalDisplaced, totalKilledAdjusted, totalChildren, byRegion };
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
