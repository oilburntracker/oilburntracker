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
    title: '6:29 AM — Hamas launches 2,200 rockets, breaches Gaza barrier',
    category: 'escalation',
    description: 'At 6:29 AM, Hamas fires 2,200+ rockets in 20 minutes across southern Israel. Simultaneously, hundreds of Nukhba commandos breach the Gaza-Israel barrier at 29 points using bulldozers, explosives, and paragliders. The largest attack on Israeli soil since 1973.',
    lat: 31.45,
    lng: 34.40,
    zoom: 10,
    sourceUrl: 'https://www.cbsnews.com/news/israel-hamas-war-timeline-major-events-since-october-7-2023/',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=_0atzea-mPY', label: 'Al Jazeera Investigation: October 7' }
    ]
  },
  {
    id: 'oct7-nova-festival',
    date: '2023-10-07',
    title: 'Nova music festival massacre — 378 gunned down',
    category: 'escalation',
    description: '3,500 young people at an outdoor music festival near Re\'im. At 6:32 AM organizers tell everyone to leave. By 7 AM armed militants on motorcycles surround the site. Attendees run into open fields — hunted and shot. Bodies found in cars, in ditches, behind trees. 378 killed (344 civilians, 34 security). 44 taken hostage. The deadliest single-site massacre. First IDF unit arrives at 11:20 AM — nearly 5 hours after the attack began.',
    casualties: { killed: 378, source: 'Israeli Government (revised April 2025)' },
    lat: 31.3853,
    lng: 34.4600,
    zoom: 14,
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
    title: 'Kibbutz Be\'eri — 12-hour siege, families executed in homes',
    category: 'escalation',
    description: 'Militants enter Be\'eri at 6:50 AM. Residents barricade in safe rooms. Terrorists go house to house, executing families, burning homes with people inside. A 12-hour siege — IDF rescue takes until nightfall. 101 civilians and 31 security personnel killed. Entire families wiped out. Children murdered in their beds. 32 hostages dragged to Gaza.',
    casualties: { killed: 132, source: 'Israeli Government' },
    lat: 31.4238,
    lng: 34.4910,
    zoom: 14,
    sourceUrl: 'https://en.wikipedia.org/wiki/Be%27eri_massacre',
    mediaUrls: [
      { type: 'news', url: 'https://www.hrw.org/news/2024/07/17/october-7-crimes-against-humanity-war-crimes-hamas-led-groups', label: 'HRW: Crimes against humanity' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=ZBx7EJbtxkY', label: 'ABC News: Inside Kibbutz Be\'eri' }
    ]
  },
  {
    id: 'oct7-kfar-aza',
    date: '2023-10-07',
    title: 'Kfar Aza — house-to-house killings, babies and elderly murdered',
    category: 'escalation',
    description: 'Hamas breaches Kfar Aza and goes door to door. Bodies found in homes and streets. Reports of sexual violence. Infants and elderly killed. At least 62 residents murdered. 19 kidnapped to Gaza. Among the first communities where journalists documented the aftermath — the images shocked the world.',
    casualties: { killed: 62, source: 'Israeli Government' },
    lat: 31.4835,
    lng: 34.5337,
    zoom: 14,
    sourceUrl: 'https://en.wikipedia.org/wiki/Kfar_Aza_massacre'
  },
  {
    id: 'oct7-nir-oz',
    date: '2023-10-07',
    title: 'Nir Oz — 1 in 4 residents kidnapped, highest hostage ratio',
    category: 'escalation',
    description: 'Small kibbutz of 400 people near the border. 47 killed and 76 taken hostage — nearly 1 in 4 residents kidnapped. The highest ratio of any community. First IDF troops arrive 40 minutes AFTER the last terrorists left. Described as a "massive failure" of military response.',
    casualties: { killed: 47, source: 'Israeli Government' },
    lat: 31.3099,
    lng: 34.4011,
    zoom: 14,
    sourceUrl: 'https://en.wikipedia.org/wiki/Nir_Oz_attack',
    mediaUrls: [
      { type: 'news', url: 'https://www.timesofisrael.com/massive-failure-first-troops-reached-kibbutz-nir-oz-40-minutes-after-last-terrorists-left', label: 'ToI: Massive failure at Nir Oz' }
    ]
  },
  {
    id: 'oct7-nahal-oz',
    date: '2023-10-07',
    title: 'Nahal Oz military base overrun — female soldiers kidnapped',
    category: 'escalation',
    description: '215 Hamas fighters storm the IDF surveillance base 850m from Gaza. The unit monitoring Gaza — destroyed. 53 soldiers killed. 10 kidnapped including 7 young female observation soldiers who had warned of unusual Hamas activity in the days before. Toxic gas used to kill soldiers in protected positions.',
    casualties: { killed: 53, injured: 7, source: 'IDF' },
    lat: 31.4727,
    lng: 34.4977,
    zoom: 14,
    sourceUrl: 'https://www.timesofisrael.com/systemic-failure-how-nahal-oz-base-850-meters-from-gaza-yet-utterly-vulnerable-fell-to-hamas/'
  },
  {
    id: 'oct7-sderot',
    date: '2023-10-07',
    title: 'Battle of Sderot — police station siege, city terrorized',
    category: 'escalation',
    description: '40 Nukhba fighters infiltrate Israel\'s largest border city. They attack the police station, killing the first officer at the entrance. Militants barricade inside. 53 killed: 37 civilians, 11 police, 2 firefighters. Last fighters not cleared until Oct 8. Station demolished with bulldozers.',
    casualties: { killed: 53, source: 'Israeli Government' },
    lat: 31.5265,
    lng: 34.5970,
    zoom: 13,
    sourceUrl: 'https://en.wikipedia.org/wiki/Battle_of_Sderot'
  },
  {
    id: 'oct7-other-communities',
    date: '2023-10-07',
    title: '254 hostages taken to Gaza — families torn apart',
    category: 'escalation',
    description: 'Across 22+ communities: Kissufim (22 killed), Re\'im base attacked, Sufa, Nirim, Ein HaShlosha, Alumim. Total Oct 7: 1,139 killed (695+ civilians, 373 soldiers, 71 foreign workers). 3,400+ wounded. 254 people — including babies, children, elderly, Holocaust survivors — dragged into Gaza as hostages. The deadliest day for Jewish people since the Holocaust.',
    casualties: { killed: 414, injured: 3400, displaced: 200000, source: 'Israeli Government — remaining communities combined', children: 36 },
    lat: 31.40,
    lng: 34.45,
    zoom: 11,
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
  // NOV-DEC 2023: HOSPITALS, CEASEFIRE, KHAN YOUNIS
  // ══════════════════════════════════════════════
  {
    id: 'nov15-al-shifa',
    date: '2023-11-15',
    title: 'IDF storms Al-Shifa Hospital — premature babies left to die',
    category: 'military_strike',
    description: 'IDF raids Gaza\'s largest hospital claiming Hamas command center beneath. 300+ patients, premature babies on failing ventilators, and medical staff trapped. WHO loses contact. 21+ patients die during siege. Nov 19: 31 premature babies evacuated — some already dead. Hospital rendered non-functional. Bodies of 2 hostages found nearby.',
    casualties: { killed: 3000, source: 'Gaza MoH (incremental Nov 1-15)' },
    lat: 31.5212,
    lng: 34.4399,
    zoom: 14,
    sourceUrl: 'https://www.bbc.com/news/world-middle-east-67423077',
    mediaUrls: [
      { type: 'news', url: 'https://www.npr.org/2024/04/06/1243045199/al-shifa-hospital-gaza-israel-raid-before-aftermath', label: 'NPR: Before and after the raid' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=8J_Qf6hpWmg', label: 'Channel 4: Israeli Forces Raid Gaza\'s Largest Hospital' }
    ]
  },
  {
    id: 'nov24-ceasefire-hostages',
    date: '2023-11-24',
    title: 'First ceasefire — 105 hostages freed in 7-day deal',
    category: 'diplomatic',
    description: 'Qatar-brokered deal: 50 Israeli hostages for 150 Palestinian prisoners, extended to 7 days. 105 hostages released (81 Israeli, 23 Thai, 1 Filipino). 240 Palestinian prisoners freed. Emotional reunions — hostages describe dark tunnels, minimal food, psychological terror. Aid surges into Gaza. First sustained break since Oct 7. By now: 14,000+ Palestinians killed.',
    casualties: { killed: 3000, source: 'Gaza MoH (incremental Nov 16-24)' },
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
    id: 'jan29-hind-rajab',
    date: '2024-01-29',
    title: 'Hind Rajab, age 6 — calls for help for hours before being killed',
    category: 'humanitarian',
    description: '6-year-old Hind Rajab calls Palestinian Red Crescent from a car surrounded by dead relatives. She whispers in terror for 3 hours. "I\'m scared. Come take me." An ambulance is dispatched — both paramedics are killed. 12 days later her body is found in the car, riddled with bullets. She becomes a symbol of the war. The ambulance found destroyed nearby.',
    casualties: { killed: 2, source: 'PRCS (2 paramedics killed en route)' },
    lat: 31.50,
    lng: 34.44,
    zoom: 14,
    sourceUrl: 'https://www.bbc.com/news/world-middle-east-68210583'
  },

  // ══════════════════════════════════════════════
  // 2024: REGIONAL ESCALATION
  // ══════════════════════════════════════════════
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
    id: 'icj-genocide-ruling',
    date: '2024-01-26',
    title: 'ICJ orders Israel to prevent genocide in Gaza',
    category: 'diplomatic',
    description: 'International Court of Justice rules South Africa\'s genocide case is plausible. Orders Israel to prevent genocide, ensure humanitarian aid, preserve evidence. Israel rejects ruling. By now: 26,000+ Palestinians killed in 111 days.',
    lat: 52.08,
    lng: 4.27,
    zoom: 8,
    sourceUrl: 'https://www.icj-cij.org/case/192'
  },
  {
    id: 'gaza-jan-apr',
    date: '2024-03-15',
    title: 'Gaza: 31,000+ killed — 70% women and children',
    category: 'humanitarian',
    description: 'By mid-March 2024, Gaza MoH reports 31,000+ killed. UN: over 70% are women and children. 72,000+ injured. Every hospital in northern Gaza destroyed or non-functional. 1.7M displaced. Starvation spreading — children dying of malnutrition for the first time. Flour massacre: 112+ killed rushing aid trucks.',
    casualties: { killed: 12000, injured: 30000, source: 'Gaza MoH (incremental Jan-Mar 2024)', children: 5000 },
    lat: 31.42,
    lng: 34.36,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/news/longform/2024/3/15/mapping-the-destruction-of-gazas-health-system'
  },
  {
    id: 'iran-israel-april-drones',
    date: '2024-04-13',
    title: 'Iran launches 300+ drones and missiles at Israel',
    category: 'retaliation',
    description: 'Iran\'s first direct attack on Israel — retaliation for Damascus consulate strike. 170 drones, 30 cruise missiles, 120 ballistic missiles. Nearly all intercepted by Israel, US, UK, Jordan, Saudi defenses. A show of force that crosses a historic threshold.',
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
    id: 'rafah-invasion',
    date: '2024-05-06',
    title: 'Israel invades Rafah — last refuge for 1.4M displaced',
    category: 'escalation',
    description: 'IDF launches ground operation in Rafah where 1.4M displaced Palestinians were sheltering — the "last safe zone." 600,000 flee in 3 days. Rafah crossing seized, aid halted. By now: 35,000+ killed. US pauses bomb shipment over civilian concerns.',
    casualties: { killed: 4000, displaced: 600000, source: 'Gaza MoH (Rafah operation through Jun)', children: 1000 },
    lat: 31.24,
    lng: 34.245,
    zoom: 12,
    sourceUrl: 'https://www.reuters.com/world/middle-east/israel-tells-eastern-rafah-residents-evacuate-2024-05-06/',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=aHnIyNFat-c', label: 'BBC News: Deadly Israeli Strikes on Rafah' }
    ],
    movements: [
      { type: 'displacement', from: [31.24, 34.24], to: [31.33, 34.30], label: '600K flee Rafah', volume: 600000 }
    ]
  },
  {
    id: 'al-mawasi-strike',
    date: '2024-07-13',
    title: 'Israel strikes "safe zone" tent camp — 90+ killed sleeping',
    category: 'military_strike',
    description: 'Airstrike hits tent camp in Al-Mawasi — an area Israel designated as a humanitarian safe zone. 90+ killed, 300+ wounded. Victims were displaced families in tents. IDF says it targeted Hamas commander. The concept of "safe zones" is dead.',
    casualties: { killed: 90, injured: 300, source: 'Gaza MoH' },
    lat: 31.30,
    lng: 34.24,
    zoom: 14,
    sourceUrl: 'https://www.bbc.com/news/articles/c3gge3n91pko'
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
    title: 'Largest West Bank raids in 20 years — parallel war',
    category: 'military_strike',
    description: 'IDF raids Jenin, Tulkarem, Tubas refugee camps simultaneously. Armored vehicles, drone strikes, bulldozed roads. 1,039 West Bank Palestinians killed since Oct 7. 225+ children. 36,000 displaced by settlement expansion. 1,828 settler attacks in 2025. The other war nobody talks about.',
    casualties: { killed: 1039, displaced: 36000, source: 'OCHA (cumulative West Bank Oct 2023-Dec 2025)', children: 225 },
    lat: 32.46,
    lng: 35.29,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/news/2025/7/1/israel-has-killed-1000-palestinians-in-the-west-bank-since-october-7-2023'
  },
  {
    id: 'hezbollah-pagers',
    date: '2024-09-17',
    title: 'Pager and walkie-talkie attacks on Hezbollah — 3,000 casualties',
    category: 'escalation',
    description: 'Israel detonates thousands of pagers and walkie-talkies used by Hezbollah across Lebanon. Nearly 3,000 wounded. Years-long supply chain infiltration operation. Unprecedented — turns everyday devices into weapons.',
    lat: 33.89,
    lng: 35.5,
    zoom: 8,
    sourceUrl: 'https://www.reuters.com/world/middle-east/hezbollah-members-wounded-when-pagers-exploded-lebanon-sources-2024-09-17/',
    mediaUrls: [
      { type: 'news', url: 'https://www.npr.org/2024/09/17/g-s1-23452/hezbollah-pagers-explode-across-lebanon-causing-nearly-3-000-casualties', label: 'NPR: Nearly 3,000 casualties' },
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=CYmuK_pLIbQ', label: 'Channel 4: Hezbollah Pager Explosions' }
    ]
  },
  {
    id: 'nasrallah-killed',
    date: '2024-09-27',
    title: 'Nasrallah killed — 4,000+ dead in Lebanon, 1M displaced',
    category: 'military_strike',
    description: 'Israeli airstrike on Hezbollah HQ in Beirut kills Secretary-General Nasrallah. The Lebanon war has killed 4,000+ and displaced 1M+. 4,000 buildings destroyed, 67 hospitals damaged, 240 health workers killed. Iran vows revenge. The region is on the edge.',
    casualties: { killed: 4000, injured: 14000, displaced: 1000000, source: 'Lebanese Health Ministry / OCHA (cumulative Lebanon)' },
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
    title: 'Iran fires 180+ ballistic missiles at Israel',
    category: 'retaliation',
    description: 'Iran\'s largest ever missile barrage. Some hit airbases. Oil prices spike. The cycle of retaliation is accelerating.',
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
    id: 'israel-strikes-iran-oct',
    date: '2024-10-26',
    title: 'Israel strikes Iran — air defenses and missile production',
    category: 'military_strike',
    description: 'Israel retaliates across 3 Iranian provinces. Avoids nuclear and oil sites. Iran signals de-escalation. But the precedent is set — direct strikes between nations are now normal.',
    lat: 35.7,
    lng: 51.42,
    zoom: 6,
    sourceUrl: 'https://www.reuters.com/world/middle-east/israeli-warplanes-carry-out-strikes-iran-israeli-military-says-2024-10-26/'
  },
  {
    id: 'gaza-end-2024',
    date: '2024-12-31',
    title: 'Gaza 2024: 45,000+ killed, 80% of buildings damaged',
    category: 'humanitarian',
    description: 'By year end: 45,000+ killed (MoH), likely 60,000+ (Lancet methodology). 100,000+ injured. 1.9M displaced — 90% of population. 80% of buildings damaged or destroyed. Every university destroyed. 60% of housing uninhabitable. No functioning hospital in northern Gaza. 1,072 IDF soldiers killed. 5,569 wounded.',
    casualties: { killed: 5000, source: 'Gaza MoH (incremental Sep-Dec 2024)', children: 2000 },
    lat: 31.42,
    lng: 34.36,
    zoom: 10,
    sourceUrl: 'https://www.ochaopt.org/content/hostilities-in-the-gaza-strip-and-israel-reported-impact-day-453'
  },

  // ══════════════════════════════════════════════
  // 2025: TOWARD FULL WAR
  // ══════════════════════════════════════════════
  {
    id: 'trump-iran-ultimatum',
    date: '2025-01-20',
    title: 'Trump inaugurated — "maximum pressure 2.0" on Iran',
    category: 'diplomatic',
    description: 'Trump takes office, issues ultimatum to Iran. Complete halt to enrichment. 90-day deadline. Sanctions reimposed.',
    lat: 38.9,
    lng: -77.04,
    zoom: 5,
    sourceUrl: 'https://www.reuters.com/world/trumps-maximum-pressure-iran-2025-01-20/'
  },
  {
    id: 'iran-90pct-enrichment',
    date: '2025-06-15',
    title: 'Iran crosses 90% enrichment — weapons-grade uranium',
    category: 'escalation',
    description: 'IAEA confirms weapons-grade enrichment. Red line crossed for Israel and US.',
    lat: 33.72,
    lng: 51.43,
    zoom: 8,
    sourceUrl: 'https://www.reuters.com/world/iran-enriches-uranium-90-percent-iaea-2025-06-15/'
  },
  {
    id: 'gaza-famine',
    date: '2025-08-22',
    title: 'Famine confirmed in Gaza — children starving to death',
    category: 'humanitarian',
    description: 'WHO formally confirms famine — first declaration. 500,000+ in famine. 43,400 children at severe risk of death from malnutrition. 422 starvation deaths in 2025 (760% increase). 55,000 pregnant women face acute malnutrition. The world watches.',
    casualties: { killed: 10000, source: 'Gaza MoH (incremental Jan-Aug 2025)', children: 3000 },
    lat: 31.42,
    lng: 34.36,
    zoom: 10,
    sourceUrl: 'https://www.who.int/news/item/22-08-2025/famine-confirmed-for-first-time-in-gaza',
    mediaUrls: [
      { type: 'youtube', url: 'https://www.youtube.com/watch?v=51BvCUpcBTc', label: 'Al Jazeera Fault Lines: Starving Gaza' }
    ]
  },
  {
    id: 'gaza-ceasefire',
    date: '2025-10-10',
    title: 'Gaza ceasefire — 20 hostages freed, but violations continue',
    category: 'diplomatic',
    description: '20 living hostages released. Hundreds of Palestinian prisoners freed. But Israel violates ceasefire 1,620+ times. 442+ Palestinians killed post-ceasefire. By now: 70,000+ killed. 81% of structures damaged. An entire civilization leveled.',
    casualties: { killed: 20000, killedAdjusted: 30000, adjustedSource: 'Lancet methodology applied to MoH — ~35% undercount', source: 'Gaza MoH (incremental Aug 2025-Feb 2026)', children: 4000 },
    lat: 31.5,
    lng: 34.47,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/features/2026/2/18/gaza-death-toll-exceeds-75000-as-independent-data-verify-loss',
    mediaUrls: [
      { type: 'news', url: 'https://www.thelancet.com/journals/langlo/article/PIIS2214-109X(25)00522-4/fulltext', label: 'Lancet: Independent mortality survey' }
    ]
  },
  {
    id: 'hormuz-mining-threat',
    date: '2025-12-01',
    title: 'Iran threatens to mine Strait of Hormuz — 21M BPD at risk',
    category: 'chokepoint',
    description: 'IRGC announces "defensive mining operations" if sanctions continue. 21% of global oil transit at risk. Insurance rates double.',
    facilityId: 'strait-of-hormuz',
    lat: 26.57,
    lng: 56.25,
    zoom: 8,
    sourceUrl: 'https://www.aljazeera.com/news/2025/12/1/iran-threatens-strait-of-hormuz-mining'
  },

  // ══════════════════════════════════════════════
  // 2026: THE IRAN WAR
  // ══════════════════════════════════════════════
  {
    id: 'us-israel-strikes-iran-nuclear',
    date: '2026-02-28',
    title: 'US/Israel bomb Iran — nuclear sites, Khamenei killed',
    category: 'military_strike',
    description: 'Joint operation strikes Natanz, Fordow, Isfahan. Bunker busters on underground centrifuge halls. Supreme Leader Khamenei killed. 175 killed in strike on girls\' school in Minab. Iran declares war. 3.2M displaced within weeks.',
    casualties: { killed: 1444, injured: 18551, displaced: 3200000, source: 'Iran Health Ministry', killedAdjusted: 3114, adjustedSource: 'HRANA — 1,354 civilians, 1,138 military, 622 unclassified' },
    lat: 33.72,
    lng: 51.73,
    zoom: 6,
    sourceUrl: 'https://www.washingtonpost.com/national-security/2026/02/28/us-israel-iran-nuclear-strike/',
    mediaUrls: [
      { type: 'news', url: 'https://www.aljazeera.com/news/2026/2/28/us-israel-bomb-iran-a-timeline-of-talks-and-threats-leading-up-to-attacks', label: 'Al Jazeera: Timeline of escalation' },
      { type: 'news', url: 'https://www.npr.org/2026/02/28/g-s1-112026/why-is-the-u-s-attacking-iran', label: 'NPR: Why the US attacked' }
    ]
  },
  {
    id: 'ras-tanura-strike',
    date: '2026-03-02',
    title: 'Iran hits Ras Tanura — Saudi\'s largest refinery',
    category: 'facility_damage',
    description: 'Iran retaliates against Gulf states. Ras Tanura (550K BPD) shuts down. First energy infrastructure hit of the war.',
    facilityId: 'ras-tanura',
    lat: 26.6427,
    lng: 50.1546,
    zoom: 10,
    sourceUrl: 'https://www.bloomberg.com/news/articles/2026-03-02/saudi-arabia-s-ras-tanura-refinery-shuts-down-after-drone-attack'
  },
  {
    id: 'bapco-strike',
    date: '2026-03-09',
    title: 'Iran sets Bahrain\'s ONLY refinery ablaze',
    category: 'facility_damage',
    description: 'BAPCO Sitra refinery hit. Force majeure declared. Bahrain has zero refining capacity.',
    casualties: { killed: 2, injured: 32, source: 'Bahrain News Agency' },
    facilityId: 'bapco-sitra',
    lat: 26.15,
    lng: 50.6167,
    zoom: 11,
    sourceUrl: 'https://www.euronews.com/business/2026/03/09/bapco-declares-force-majeure-as-iran-sets-bahrains-only-refinery-ablaze'
  },
  {
    id: 'kharg-island-strike',
    date: '2026-03-13',
    title: 'US bombs 90+ targets on Kharg Island — Iran\'s oil lifeline',
    category: 'military_strike',
    description: 'Kharg handles 90% of Iran\'s crude exports. Military targets hit, exports disrupted.',
    facilityId: 'kharg-island',
    lat: 29.2333,
    lng: 50.3167,
    zoom: 10,
    sourceUrl: 'https://www.washingtonpost.com/politics/2026/03/13/trump-us-iran-war-kharg-island-oil/'
  },
  {
    id: 'shah-fujairah-strikes',
    date: '2026-03-16',
    title: 'Iran hits UAE — 8 killed, Dubai airport struck',
    category: 'facility_damage',
    description: 'Shah Gas Field and Fujairah storage ablaze. Dubai airport fuel tank fire. 8 killed including 6 civilians.',
    casualties: { killed: 8, injured: 157, source: 'UAE authorities / HRW' },
    facilityId: 'shah-gas-field',
    lat: 23.4,
    lng: 53.7,
    zoom: 7,
    sourceUrl: 'https://www.bloomberg.com/news/articles/2026-03-16/drone-strike-sets-uae-natural-gas-field-ablaze-abu-dhabi-says'
  },
  {
    id: 'south-pars-strike',
    date: '2026-03-18',
    title: 'South Pars hit — world\'s largest gas field knocked offline',
    category: 'military_strike',
    description: '4 gas treatment plants hit. Iran loses 60%+ domestic gas. 14 BCF/day facility taken offline.',
    facilityId: 'south-pars',
    lat: 27.4833,
    lng: 52.6,
    zoom: 9,
    sourceUrl: 'https://www.axios.com/2026/03/18/israel-strikes-iran-natural-gas-infrastructure'
  },
  {
    id: 'ras-laffan-retaliation',
    date: '2026-03-18',
    title: 'Iran retaliates — missile hits Ras Laffan, 20% of global LNG',
    category: 'retaliation',
    description: 'Hours after South Pars, Iran fires 5 missiles at Ras Laffan. 4 intercepted, 1 hits. Fire and extensive damage.',
    facilityId: 'ras-laffan',
    lat: 25.9,
    lng: 51.5333,
    zoom: 10,
    sourceUrl: 'https://www.aljazeera.com/news/2026/3/18/qatar-says-iran-missile-attack-sparks-fire-causes-damage-at-gas-facility'
  },
  {
    id: 'iran-threatens-targets',
    date: '2026-03-18',
    title: 'Iran names 6 Gulf facilities as targets — orders evacuations',
    category: 'escalation',
    description: 'Iran publicly names SAMREF Yanbu, Jubail, Al Hosn, Mesaieed as imminent targets.',
    lat: 25.0,
    lng: 50.0,
    zoom: 6,
    sourceUrl: 'https://www.middleeasteye.net/news/iran-issues-order-evacuate-petrochemical-facilities-saudi-arabia-qatar-and-uae'
  },
  {
    id: 'mina-al-ahmadi-strike',
    date: '2026-03-19',
    title: 'Iran hits Kuwait\'s largest refinery — war spreading',
    category: 'facility_damage',
    description: 'Mina al-Ahmadi (466K BPD) hit. Conflict now involves previously uninvolved Gulf states.',
    facilityId: 'mina-al-ahmadi',
    lat: 29.0667,
    lng: 48.1667,
    zoom: 10,
    sourceUrl: 'https://www.businesstoday.in/world/story/kuwait-reports-second-refinery-fire-after-drone-attack-at-mina-al-ahmadi-521391-2026-03-19'
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
