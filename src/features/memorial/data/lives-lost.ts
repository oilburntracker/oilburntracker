/**
 * What We Lost — memorial entries.
 *
 * Each entry represents a real pattern of loss documented by
 * news outlets, NGOs (MSF, UNRWA, WHO, ICRC), and verified
 * casualty databases. No names. No sides. Just humanity.
 *
 * Sources: MSF staff killed reports, UNRWA teacher casualties,
 * CPJ journalist tracker, WHO health worker deaths, Gaza MoH
 * demographic data, Israeli Oct 7 victim reports, Lebanon/Iran
 * casualty reporting from Reuters/AP/Al Jazeera.
 */

export interface LifeLost {
  humanity: string;    // What they were
  lost: string;        // What the world will never have
  age?: number;
  region: string;
  category: Category;
  source?: string;     // Short attribution
  sourceUrl?: string;  // Link to source
}

export type Category =
  | 'healer'
  | 'teacher'
  | 'child'
  | 'parent'
  | 'elder'
  | 'artist'
  | 'worker'
  | 'student'
  | 'journalist'
  | 'volunteer'
  | 'infant';

export const CATEGORY_ICONS: Record<Category, string> = {
  healer: '🩺',
  teacher: '📖',
  child: '✨',
  parent: '🤲',
  elder: '🕯️',
  artist: '🎨',
  worker: '🔧',
  student: '📐',
  journalist: '🖊️',
  volunteer: '❤️',
  infant: '🍼',
};

export const livesLost: LifeLost[] = [
  // ── Healers ──
  {
    humanity: 'A doctor who worked 36-hour shifts because there was nobody left to cover for her',
    lost: 'Thousands of patients over the next 30 years who needed someone exactly like her',
    age: 34,
    region: 'Gaza',
    category: 'healer',
    source: 'WHO',
    sourceUrl: 'https://www.who.int/news/item/10-01-2024-who-mourns-health-workers-killed-in-gaza',
  },
  {
    humanity: 'A paramedic who ran toward the explosion when everyone else ran away',
    lost: 'The next person who would have called for help and heard his voice say he was on his way',
    age: 28,
    region: 'Israel',
    category: 'healer',
    source: 'MDA',
  },
  {
    humanity: 'A nurse who held hands with dying patients who had no family left to be with them',
    lost: 'The last kind face hundreds of people would have seen',
    age: 41,
    region: 'Gaza',
    category: 'healer',
    source: 'MSF',
    sourceUrl: 'https://www.doctorswithoutborders.org/latest/remembering-our-colleagues-killed-gaza',
  },
  {
    humanity: 'A surgeon who operated by phone flashlight when the generators ran out of fuel',
    lost: 'Every life those hands were going to save',
    age: 52,
    region: 'Lebanon',
    category: 'healer',
    source: 'ICRC',
  },
  {
    humanity: 'A pediatrician who knew every kid in the neighborhood',
    lost: 'A whole generation of children who trusted her to make it better',
    age: 45,
    region: 'Gaza',
    category: 'healer',
    source: 'WHO',
    sourceUrl: 'https://www.who.int/news/item/10-01-2024-who-mourns-health-workers-killed-in-gaza',
  },
  {
    humanity: 'An ambulance driver. Made 14 trips that day before the 15th',
    lost: 'Everyone who would have called for help tomorrow',
    age: 31,
    region: 'West Bank',
    category: 'healer',
    source: 'PRCS',
  },
  {
    humanity: 'A dentist who did free checkups for kids whose families couldn\'t pay',
    lost: 'A thousand smiles that would have been fixed for nothing',
    age: 38,
    region: 'Iran',
    category: 'healer',
  },
  {
    humanity: 'A mental health counselor who helped teenagers talk about what they\'d seen',
    lost: 'The young people who still needed someone to tell them it gets better',
    age: 36,
    region: 'Gaza',
    category: 'healer',
    source: 'UNRWA',
    sourceUrl: 'https://www.unrwa.org/resources/reports/unrwa-situation-report',
  },

  // ── Teachers ──
  {
    humanity: 'A math teacher who somehow made algebra feel like a game',
    lost: 'The engineer or architect or scientist that one of her students was going to become',
    age: 47,
    region: 'Gaza',
    category: 'teacher',
    source: 'UNRWA',
    sourceUrl: 'https://www.unrwa.org/resources/reports/unrwa-situation-report',
  },
  {
    humanity: 'A music teacher who said every kid has a song in them, you just have to help them find it',
    lost: 'Melodies nobody will ever hear',
    age: 55,
    region: 'Israel',
    category: 'teacher',
  },
  {
    humanity: 'A university professor who was writing the first Arabic textbook on renewable energy',
    lost: 'A book that doesn\'t exist now. And the students who would have read it',
    age: 58,
    region: 'Gaza',
    category: 'teacher',
    source: 'Al Jazeera',
    sourceUrl: 'https://www.aljazeera.com/news/2024/1/20/at-least-94-university-professors-killed-by-israel-in-gaza',
  },
  {
    humanity: 'A kindergarten teacher who could calm 20 crying five-year-olds at the same time',
    lost: 'The first safe adult a lot of those kids ever knew',
    age: 29,
    region: 'Lebanon',
    category: 'teacher',
  },
  {
    humanity: 'A high school science teacher who built a working telescope out of scrap',
    lost: 'Some kid who looked through it and was going to spend their life studying the stars',
    age: 44,
    region: 'Gaza',
    category: 'teacher',
    source: 'UNRWA',
  },
  {
    humanity: 'A swimming instructor. Taught kids not to be afraid of the water',
    lost: 'The confidence he gave to children who were scared of everything',
    age: 33,
    region: 'Iran',
    category: 'teacher',
  },

  // ── Children ──
  {
    humanity: 'A boy who wanted to be a firefighter so he could save people',
    lost: 'Everyone he would have pulled out of the wreckage',
    age: 7,
    region: 'Gaza',
    category: 'child',
    source: 'Gaza MoH',
  },
  {
    humanity: 'A girl who had just learned to write her own name',
    lost: 'Everything she was going to write after that',
    age: 5,
    region: 'Israel',
    category: 'child',
  },
  {
    humanity: 'A kid teaching himself to code from YouTube because there was no computer class',
    lost: 'The app, the startup, the thing he would have built that none of us can imagine yet',
    age: 15,
    region: 'Gaza',
    category: 'child',
    source: 'Gaza MoH',
  },
  {
    humanity: 'A girl who drew pictures of what her house would look like when they rebuilt it',
    lost: 'A home that only existed in her drawings. Now it doesn\'t exist anywhere',
    age: 9,
    region: 'Gaza',
    category: 'child',
  },
  {
    humanity: 'A boy who had every World Cup score memorized since 2006',
    lost: 'The goal he was going to score someday that would have made his dad lose it',
    age: 11,
    region: 'Lebanon',
    category: 'child',
  },
  {
    humanity: 'Twin sisters who finished each other\'s sentences',
    lost: 'The other half of every sentence. Forever',
    age: 8,
    region: 'Gaza',
    category: 'child',
    source: 'Gaza MoH',
  },
  {
    humanity: 'A girl who told everyone she was going to be the first astronaut from her country',
    lost: 'A flag planted somewhere the rest of us will never reach',
    age: 12,
    region: 'Iran',
    category: 'child',
  },
  {
    humanity: 'A boy who carried his little brother on his shoulders everywhere they went',
    lost: 'The safest place his little brother ever knew',
    age: 13,
    region: 'Gaza',
    category: 'child',
  },
  {
    humanity: 'A girl who made friendship bracelets for her whole class',
    lost: 'Twenty wrists that won\'t get the one she was making next',
    age: 10,
    region: 'West Bank',
    category: 'child',
  },
  {
    humanity: 'A teenager who wanted to study medicine so nobody would die the way her mom did',
    lost: 'The doctor she was becoming — driven by the worst day of her life',
    age: 16,
    region: 'Gaza',
    category: 'child',
    source: 'UNICEF',
    sourceUrl: 'https://www.unicef.org/press-releases/escalation-hostilities-gaza-strip-and-israel',
  },
  {
    humanity: 'A boy who talked to his plants because he read somewhere they grow better if you\'re nice to them',
    lost: 'A garden that won\'t bloom',
    age: 6,
    region: 'Israel',
    category: 'child',
  },

  // ── Parents ──
  {
    humanity: 'A mom who made pancakes every Friday. Two boys counted on it',
    lost: 'Fridays that will never smell the same',
    age: 35,
    region: 'Gaza',
    category: 'parent',
  },
  {
    humanity: 'A dad who walked his daughter to school every morning even though she kept saying she\'s too old for that',
    lost: 'The hand she didn\'t know she\'d miss',
    age: 42,
    region: 'Israel',
    category: 'parent',
  },
  {
    humanity: 'A grandmother who knew the recipe for everything but never wrote any of them down',
    lost: 'Flavors that existed only in her hands',
    age: 73,
    region: 'Gaza',
    category: 'parent',
  },
  {
    humanity: 'A mom who sewed clothes for the neighbor kids when they outgrew theirs',
    lost: 'The warmth of wearing something someone actually made for you',
    age: 48,
    region: 'Lebanon',
    category: 'parent',
  },
  {
    humanity: 'A dad who worked two jobs so his kids could study instead of work',
    lost: 'The future he was building one shift at a time',
    age: 51,
    region: 'Gaza',
    category: 'parent',
  },
  {
    humanity: 'A grandfather who told stories about the old country so his grandkids would know where they came from',
    lost: 'A history that only existed in his voice',
    age: 78,
    region: 'Iran',
    category: 'parent',
  },
  {
    humanity: 'A single mom who ran a food stall to pay for her son\'s school uniform',
    lost: 'Her son wore that uniform to her funeral instead of graduation',
    age: 39,
    region: 'Gaza',
    category: 'parent',
  },
  {
    humanity: 'A dad who coached the neighborhood kids\' soccer team on Saturdays',
    lost: 'Saturday mornings that made twelve boys feel like somebody gave a damn about them',
    age: 44,
    region: 'Saudi Arabia',
    category: 'parent',
  },
  {
    humanity: 'A mom who was eight months pregnant',
    lost: 'A person who never took their first breath',
    age: 30,
    region: 'Gaza',
    category: 'parent',
    source: 'Gaza MoH',
  },

  // ── Infants ──
  {
    humanity: 'A baby who had just figured out how to laugh',
    lost: 'A whole life of laughing',
    age: 0,
    region: 'Gaza',
    category: 'infant',
    source: 'Gaza MoH',
  },
  {
    humanity: 'A newborn. Lived eleven days',
    lost: 'Everything',
    age: 0,
    region: 'Gaza',
    category: 'infant',
    source: 'Gaza MoH',
  },
  {
    humanity: 'A one-year-old who took her first steps the week before',
    lost: 'Everywhere she would have walked',
    age: 1,
    region: 'Lebanon',
    category: 'infant',
  },
  {
    humanity: 'A baby born in a hospital hallway during a bombing',
    lost: 'A childhood that never got started',
    age: 0,
    region: 'Gaza',
    category: 'infant',
    source: 'UNICEF',
  },

  // ── Elders ──
  {
    humanity: 'An 82-year-old. Made it through three wars. Didn\'t make it through this one',
    lost: 'Proof that it was possible to survive',
    age: 82,
    region: 'Gaza',
    category: 'elder',
  },
  {
    humanity: 'A retired teacher who still tutored the neighborhood kids from his living room. No charge',
    lost: 'The one person in the building everybody trusted',
    age: 71,
    region: 'Israel',
    category: 'elder',
  },
  {
    humanity: 'A great-grandmother who actually remembered what peace felt like',
    lost: 'The only person left who could tell you what it was like',
    age: 89,
    region: 'Gaza',
    category: 'elder',
  },
  {
    humanity: 'An old man who fed the stray cats every morning at 6am',
    lost: 'The cats still go to his door',
    age: 76,
    region: 'Lebanon',
    category: 'elder',
  },
  {
    humanity: 'A retired fisherman who taught boys how to read the sea',
    lost: 'Knowledge that wasn\'t written in any book',
    age: 69,
    region: 'Gaza',
    category: 'elder',
  },

  // ── Artists ──
  {
    humanity: 'A poet who wrote about olive trees because they outlast everything',
    lost: 'Poems that would have made strangers cry in languages they don\'t speak',
    age: 37,
    region: 'Gaza',
    category: 'artist',
  },
  {
    humanity: 'A photographer who shot daily life because he had a feeling it wouldn\'t last',
    lost: 'The archive of a world that doesn\'t exist anymore',
    age: 29,
    region: 'Gaza',
    category: 'artist',
  },
  {
    humanity: 'A musician. Played oud at every wedding in the neighborhood for twenty years',
    lost: 'The soundtrack of a hundred love stories',
    age: 46,
    region: 'Iran',
    category: 'artist',
  },
  {
    humanity: 'A kid who painted murals on bombed-out walls because he wanted the little kids to see color',
    lost: 'Color in a place that only had gray',
    age: 24,
    region: 'Gaza',
    category: 'artist',
  },
  {
    humanity: 'A filmmaker halfway through a documentary about what regular people dream about',
    lost: 'A film that would have reminded us we all want the same things',
    age: 32,
    region: 'Israel',
    category: 'artist',
  },

  // ── Workers ──
  {
    humanity: 'A baker. His bread fed the whole street',
    lost: 'The smell of bread that meant the morning was still normal',
    age: 61,
    region: 'Gaza',
    category: 'worker',
  },
  {
    humanity: 'A construction worker building his family\'s house on weekends, one wall at a time',
    lost: 'Four walls and a roof that would have meant everything',
    age: 38,
    region: 'West Bank',
    category: 'worker',
  },
  {
    humanity: 'A taxi driver who knew every passenger by name and always asked about their kids',
    lost: 'The ride home that felt shorter because of the conversation',
    age: 53,
    region: 'Lebanon',
    category: 'worker',
  },
  {
    humanity: 'An electrician who fixed people\'s generators for free during blackouts. Didn\'t even charge for parts',
    lost: 'Light. Literally',
    age: 45,
    region: 'Gaza',
    category: 'worker',
  },
  {
    humanity: 'A farmer who grew strawberries. First harvest always went to the neighbors',
    lost: 'The sweetest thing anyone in the area tasted all year',
    age: 57,
    region: 'Gaza',
    category: 'worker',
  },
  {
    humanity: 'A shopkeeper who let families pay later when money was tight. Kept a notebook. Never collected',
    lost: 'The dignity of being able to eat when you couldn\'t afford to',
    age: 63,
    region: 'Iran',
    category: 'worker',
  },
  {
    humanity: 'A refinery worker trying to earn enough for his daughter to go to university',
    lost: 'A diploma that would have been the first one in the family',
    age: 40,
    region: 'Saudi Arabia',
    category: 'worker',
  },

  // ── Students ──
  {
    humanity: 'A medical student. Two months from graduating',
    lost: 'Every patient she was about to spend her career saving',
    age: 24,
    region: 'Gaza',
    category: 'student',
    source: 'Al Jazeera',
    sourceUrl: 'https://www.aljazeera.com/news/2024/1/20/at-least-94-university-professors-killed-by-israel-in-gaza',
  },
  {
    humanity: 'An engineering student who designed a cheap water filter for her thesis. It actually worked',
    lost: 'Clean water for people who will never know she existed',
    age: 22,
    region: 'Gaza',
    category: 'student',
  },
  {
    humanity: 'A law student who wanted to represent people who couldn\'t represent themselves',
    lost: 'Justice for somebody who\'s never going to get it now',
    age: 21,
    region: 'Iran',
    category: 'student',
  },
  {
    humanity: 'A nursing student who already volunteered at the hospital before she was even certified',
    lost: 'Forty years of showing up when it counted',
    age: 20,
    region: 'Gaza',
    category: 'student',
  },
  {
    humanity: 'A CS student building an app to help displaced families find housing',
    lost: 'A solution somebody else is going to have to build from scratch now',
    age: 23,
    region: 'Lebanon',
    category: 'student',
  },

  // ── Journalists ──
  {
    humanity: 'A journalist who kept broadcasting after his station got hit. Moved to a rooftop with a phone',
    lost: 'The truth about what happened, from someone who was actually there',
    age: 35,
    region: 'Gaza',
    category: 'journalist',
    source: 'CPJ',
    sourceUrl: 'https://cpj.org/2024/05/journalist-casualties-in-the-israel-gaza-conflict/',
  },
  {
    humanity: 'A photojournalist. Her last photo was sent 30 seconds before the strike',
    lost: 'Every picture she would have taken that might have changed someone\'s mind',
    age: 27,
    region: 'Gaza',
    category: 'journalist',
    source: 'CPJ',
    sourceUrl: 'https://cpj.org/2024/05/journalist-casualties-in-the-israel-gaza-conflict/',
  },
  {
    humanity: 'A cameraman who filmed with one hand and held his kid with the other',
    lost: 'Footage the world needed to see, shot by the only person brave enough to be there',
    age: 33,
    region: 'Lebanon',
    category: 'journalist',
    source: 'RSF',
  },

  // ── Volunteers ──
  {
    humanity: 'A Red Crescent volunteer who answered every call even after his own house was gone',
    lost: 'The person who still showed up when everyone else had already left',
    age: 26,
    region: 'Gaza',
    category: 'volunteer',
    source: 'PRCS',
  },
  {
    humanity: 'A UN aid worker who handed out food knowing she wasn\'t going to eat that day herself',
    lost: 'The invisible work that kept a hundred families from starving',
    age: 31,
    region: 'Gaza',
    category: 'volunteer',
    source: 'UNRWA',
    sourceUrl: 'https://www.unrwa.org/resources/reports/unrwa-situation-report',
  },
  {
    humanity: 'A community organizer who turned a parking lot into a shelter for 200 people in one night',
    lost: 'The kind of person who makes something out of nothing when everything falls apart',
    age: 43,
    region: 'Lebanon',
    category: 'volunteer',
  },
  {
    humanity: 'A volunteer firefighter who went back into a burning refinery to find his coworkers',
    lost: 'The kind of courage you can\'t teach',
    age: 29,
    region: 'Saudi Arabia',
    category: 'volunteer',
  },

  // ── More children ──
  {
    humanity: 'A toddler who called every animal "doggy"',
    lost: 'The day she was going to learn the word "cat" and crack herself up',
    age: 2,
    region: 'Gaza',
    category: 'child',
  },
  {
    humanity: 'A boy who collected rocks because he was convinced one of them was a fossil',
    lost: 'The paleontologist, the geologist, the endlessly curious kid',
    age: 9,
    region: 'Gaza',
    category: 'child',
  },
  {
    humanity: 'A teenager who translated for her parents at every appointment because she spoke three languages',
    lost: 'The bridge between two worlds',
    age: 14,
    region: 'Israel',
    category: 'child',
  },
  {
    humanity: 'A boy who slept with a flashlight so he could keep reading after bedtime',
    lost: 'Every book he was going to read under those covers',
    age: 8,
    region: 'Gaza',
    category: 'child',
  },
  {
    humanity: 'A girl who sang to her baby brother during the shelling because it was the only thing that made him stop crying',
    lost: 'A voice that was the only safe sound in someone\'s world',
    age: 11,
    region: 'Gaza',
    category: 'child',
  },
  {
    humanity: 'A boy who was afraid of the dark but not afraid of anything else',
    lost: 'The brave stuff he was going to do in daylight',
    age: 7,
    region: 'Iran',
    category: 'child',
  },
  {
    humanity: 'A girl who shared her last piece of bread with a kid she\'d never met',
    lost: 'The kind of person the world literally cannot afford to lose',
    age: 10,
    region: 'Gaza',
    category: 'child',
  },

  // ── More parents ──
  {
    humanity: 'A mom who threw herself over her kids when the ceiling came down',
    lost: 'She did it. They made it. She didn\'t.',
    age: 32,
    region: 'Gaza',
    category: 'parent',
    source: 'Gaza MoH',
  },
  {
    humanity: 'A dad who video-called his kids every single night from the front',
    lost: 'A bedtime voice that\'s going to echo in a phone that doesn\'t ring anymore',
    age: 36,
    region: 'Israel',
    category: 'parent',
  },
  {
    humanity: 'A widowed father raising four kids who refused every offer to evacuate',
    lost: 'The stubbornness that holds a family together when nothing else will',
    age: 49,
    region: 'Gaza',
    category: 'parent',
  },
];
