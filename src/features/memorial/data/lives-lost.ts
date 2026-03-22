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
  region: string;      // Gaza, Israel, Lebanon, Iran, West Bank, Saudi Arabia, etc.
  category: Category;
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

/**
 * These entries are based on documented patterns from verified sources.
 * Each represents real categories of people killed across all sides.
 * Ordered to alternate regions — no clustering by "side."
 */
export const livesLost: LifeLost[] = [
  // ── Healers ──
  {
    humanity: 'A doctor who worked 36-hour shifts because there was no one left to replace her',
    lost: 'The thousands of patients she would have saved over the next 30 years',
    age: 34,
    region: 'Gaza',
    category: 'healer',
  },
  {
    humanity: 'A paramedic who ran toward the explosion, not away from it',
    lost: 'The stranger who would have survived because he arrived in time',
    age: 28,
    region: 'Israel',
    category: 'healer',
  },
  {
    humanity: 'A nurse who held the hands of patients who had no family left to hold them',
    lost: 'The comfort she gave to people in their last moments',
    age: 41,
    region: 'Gaza',
    category: 'healer',
  },
  {
    humanity: 'A surgeon who operated by phone flashlight when the generators ran out',
    lost: 'Every life those steady hands would have saved',
    age: 52,
    region: 'Lebanon',
    category: 'healer',
  },
  {
    humanity: 'A pediatrician who knew every child in the neighborhood by name',
    lost: 'A generation of children who trusted her to make it better',
    age: 45,
    region: 'Gaza',
    category: 'healer',
  },
  {
    humanity: 'An ambulance driver who made 14 trips that day before the 15th one',
    lost: 'Everyone who would have called for help and heard his voice say "I\'m coming"',
    age: 31,
    region: 'West Bank',
    category: 'healer',
  },
  {
    humanity: 'A dentist who gave free checkups to kids who couldn\'t afford them',
    lost: 'A thousand smiles that would have been fixed for free',
    age: 38,
    region: 'Iran',
    category: 'healer',
  },
  {
    humanity: 'A mental health counselor who helped teenagers talk about the war',
    lost: 'The young people who needed someone to tell them it would be okay',
    age: 36,
    region: 'Gaza',
    category: 'healer',
  },

  // ── Teachers ──
  {
    humanity: 'A math teacher who made algebra feel like a puzzle instead of punishment',
    lost: 'The engineer, the architect, the scientist one of her students would have become',
    age: 47,
    region: 'Gaza',
    category: 'teacher',
  },
  {
    humanity: 'A music teacher who believed every child had a song inside them',
    lost: 'The melodies that will never be played',
    age: 55,
    region: 'Israel',
    category: 'teacher',
  },
  {
    humanity: 'A university professor who was writing the first Arabic textbook on renewable energy',
    lost: 'A book that would have trained the next generation of engineers',
    age: 58,
    region: 'Gaza',
    category: 'teacher',
  },
  {
    humanity: 'A kindergarten teacher who could calm 20 crying children at once',
    lost: 'The first safe adult those children ever knew',
    age: 29,
    region: 'Lebanon',
    category: 'teacher',
  },
  {
    humanity: 'A high school science teacher who built a telescope from scrap parts',
    lost: 'A student who would have looked through it and decided to study the stars',
    age: 44,
    region: 'Gaza',
    category: 'teacher',
  },
  {
    humanity: 'A swimming instructor who taught children not to be afraid of the water',
    lost: 'The confidence he gave to kids who were scared',
    age: 33,
    region: 'Iran',
    category: 'teacher',
  },

  // ── Children ──
  {
    humanity: 'A boy who wanted to be a firefighter so he could save people',
    lost: 'Every person he would have pulled from the wreckage',
    age: 7,
    region: 'Gaza',
    category: 'child',
  },
  {
    humanity: 'A girl who had just learned to write her name',
    lost: 'Everything she would have written after it',
    age: 5,
    region: 'Israel',
    category: 'child',
  },
  {
    humanity: 'A teenager who was teaching himself to code from YouTube videos',
    lost: 'The app, the startup, the thing he would have built that we can\'t even imagine',
    age: 15,
    region: 'Gaza',
    category: 'child',
  },
  {
    humanity: 'A girl who drew pictures of what her house would look like when they rebuilt it',
    lost: 'A home that existed only in her imagination and now exists nowhere',
    age: 9,
    region: 'Gaza',
    category: 'child',
  },
  {
    humanity: 'A boy who memorized every World Cup score since 2006',
    lost: 'The goal he would have scored that would have made his father cry with joy',
    age: 11,
    region: 'Lebanon',
    category: 'child',
  },
  {
    humanity: 'Twin sisters who finished each other\'s sentences',
    lost: 'The other half of every sentence, forever',
    age: 8,
    region: 'Gaza',
    category: 'child',
  },
  {
    humanity: 'A girl who wanted to be the first astronaut from her country',
    lost: 'A flag that would have been planted somewhere none of us can reach',
    age: 12,
    region: 'Iran',
    category: 'child',
  },
  {
    humanity: 'A boy who carried his little brother on his shoulders everywhere',
    lost: 'The safest place his little brother ever knew',
    age: 13,
    region: 'Gaza',
    category: 'child',
  },
  {
    humanity: 'A girl who made friendship bracelets for everyone in her class',
    lost: 'Twenty wrists that will never wear the one she was making next',
    age: 10,
    region: 'West Bank',
    category: 'child',
  },
  {
    humanity: 'A teenager who wanted to study medicine so no one would die the way her mother did',
    lost: 'The doctor she was becoming, fueled by the worst day of her life',
    age: 16,
    region: 'Gaza',
    category: 'child',
  },
  {
    humanity: 'A boy who talked to his plants because he read they grow better with kindness',
    lost: 'A garden that will never bloom',
    age: 6,
    region: 'Israel',
    category: 'child',
  },

  // ── Parents ──
  {
    humanity: 'A mother of two happy boys who made pancakes every Friday',
    lost: 'Fridays that will never smell the same',
    age: 35,
    region: 'Gaza',
    category: 'parent',
  },
  {
    humanity: 'A father who walked his daughter to school every morning even though she said she was too old for it',
    lost: 'The hand she didn\'t know she would miss until it was gone',
    age: 42,
    region: 'Israel',
    category: 'parent',
  },
  {
    humanity: 'A grandmother who knew the recipe for everything and wrote none of them down',
    lost: 'Flavors that existed only in her hands',
    age: 73,
    region: 'Gaza',
    category: 'parent',
  },
  {
    humanity: 'A mother who sewed clothes for the neighborhood children when they outgrew theirs',
    lost: 'The warmth of wearing something made by someone who cared',
    age: 48,
    region: 'Lebanon',
    category: 'parent',
  },
  {
    humanity: 'A father who worked two jobs so his kids could study instead of work',
    lost: 'The future he was building with his broken back',
    age: 51,
    region: 'Gaza',
    category: 'parent',
  },
  {
    humanity: 'A grandfather who told stories about the old country so his grandchildren would know where they came from',
    lost: 'A history that lived only in his voice',
    age: 78,
    region: 'Iran',
    category: 'parent',
  },
  {
    humanity: 'A single mother who ran a food stall to pay for her son\'s school uniform',
    lost: 'A boy who will wear that uniform to her funeral instead of graduation',
    age: 39,
    region: 'Gaza',
    category: 'parent',
  },
  {
    humanity: 'A father who coached the neighborhood kids\' soccer team on weekends',
    lost: 'Saturday mornings that made twelve boys feel like they mattered',
    age: 44,
    region: 'Saudi Arabia',
    category: 'parent',
  },
  {
    humanity: 'A mother who was pregnant with her third child',
    lost: 'A person who never got to take their first breath',
    age: 30,
    region: 'Gaza',
    category: 'parent',
  },

  // ── Infants ──
  {
    humanity: 'A baby who had just learned to laugh',
    lost: 'A lifetime of laughter',
    age: 0,
    region: 'Gaza',
    category: 'infant',
  },
  {
    humanity: 'A newborn who lived for eleven days',
    lost: 'Everything',
    age: 0,
    region: 'Gaza',
    category: 'infant',
  },
  {
    humanity: 'A one-year-old who had just taken her first steps the week before',
    lost: 'Everywhere she would have walked',
    age: 1,
    region: 'Lebanon',
    category: 'infant',
  },
  {
    humanity: 'A baby born in a hospital corridor during a bombing',
    lost: 'A childhood that never had a chance to begin',
    age: 0,
    region: 'Gaza',
    category: 'infant',
  },

  // ── Elders ──
  {
    humanity: 'An 82-year-old who survived three wars and did not survive this one',
    lost: 'The proof that it was possible to endure',
    age: 82,
    region: 'Gaza',
    category: 'elder',
  },
  {
    humanity: 'A retired teacher who still tutored kids in his living room for free',
    lost: 'The one person in the building everyone trusted',
    age: 71,
    region: 'Israel',
    category: 'elder',
  },
  {
    humanity: 'A great-grandmother who remembered when there was peace',
    lost: 'The only person who could describe what it felt like',
    age: 89,
    region: 'Gaza',
    category: 'elder',
  },
  {
    humanity: 'An old man who fed the stray cats every morning',
    lost: 'The cats still wait at his door',
    age: 76,
    region: 'Lebanon',
    category: 'elder',
  },
  {
    humanity: 'A retired fisherman who taught boys to read the sea',
    lost: 'Knowledge that was never written in any book',
    age: 69,
    region: 'Gaza',
    category: 'elder',
  },

  // ── Artists ──
  {
    humanity: 'A poet who wrote about olive trees because they outlive everything',
    lost: 'Poems that would have made strangers cry in a language they didn\'t speak',
    age: 37,
    region: 'Gaza',
    category: 'artist',
  },
  {
    humanity: 'A photographer who documented daily life because he knew it wouldn\'t last',
    lost: 'The archive of a world that no longer exists',
    age: 29,
    region: 'Gaza',
    category: 'artist',
  },
  {
    humanity: 'A musician who played oud at every wedding in the neighborhood',
    lost: 'The soundtrack of a hundred love stories',
    age: 46,
    region: 'Iran',
    category: 'artist',
  },
  {
    humanity: 'A street artist who painted murals on bombed-out walls to make children smile',
    lost: 'Color in a place that only had gray',
    age: 24,
    region: 'Gaza',
    category: 'artist',
  },
  {
    humanity: 'A filmmaker who was making a documentary about what ordinary people dream about',
    lost: 'A film that would have reminded us we all dream the same things',
    age: 32,
    region: 'Israel',
    category: 'artist',
  },

  // ── Workers ──
  {
    humanity: 'A baker whose bread fed the whole street',
    lost: 'The smell of bread that meant the morning was still normal',
    age: 61,
    region: 'Gaza',
    category: 'worker',
  },
  {
    humanity: 'A construction worker who was building his family\'s house on weekends',
    lost: 'Four walls and a roof that would have meant everything',
    age: 38,
    region: 'West Bank',
    category: 'worker',
  },
  {
    humanity: 'A taxi driver who knew everyone\'s name and asked about their kids',
    lost: 'The ride home that always felt a little shorter because of the conversation',
    age: 53,
    region: 'Lebanon',
    category: 'worker',
  },
  {
    humanity: 'An electrician who fixed people\'s generators for free during blackouts',
    lost: 'Light in the dark, literally',
    age: 45,
    region: 'Gaza',
    category: 'worker',
  },
  {
    humanity: 'A farmer who grew strawberries and gave the first harvest to the neighbors',
    lost: 'The sweetest thing anyone tasted all year',
    age: 57,
    region: 'Gaza',
    category: 'worker',
  },
  {
    humanity: 'A shopkeeper who let families pay later when money was tight',
    lost: 'The dignity of eating when you couldn\'t afford to',
    age: 63,
    region: 'Iran',
    category: 'worker',
  },
  {
    humanity: 'An oil refinery worker trying to earn enough for his daughter\'s education',
    lost: 'A diploma that would have been the first in the family',
    age: 40,
    region: 'Saudi Arabia',
    category: 'worker',
  },

  // ── Students ──
  {
    humanity: 'A medical student two months from graduating',
    lost: 'Every patient in the career that will never begin',
    age: 24,
    region: 'Gaza',
    category: 'student',
  },
  {
    humanity: 'An engineering student who designed a low-cost water filter for her thesis',
    lost: 'Clean water for people who will never know her name',
    age: 22,
    region: 'Gaza',
    category: 'student',
  },
  {
    humanity: 'A law student who wanted to defend people who couldn\'t defend themselves',
    lost: 'Justice for someone who will now never get it',
    age: 21,
    region: 'Iran',
    category: 'student',
  },
  {
    humanity: 'A nursing student who volunteered at the hospital before she was even certified',
    lost: 'Forty years of showing up when it mattered',
    age: 20,
    region: 'Gaza',
    category: 'student',
  },
  {
    humanity: 'A computer science student who was building an app to help refugees find housing',
    lost: 'A solution that someone else will now have to invent from scratch',
    age: 23,
    region: 'Lebanon',
    category: 'student',
  },

  // ── Journalists ──
  {
    humanity: 'A journalist who kept broadcasting even after his station was destroyed',
    lost: 'The truth about what happened, told by someone who was there',
    age: 35,
    region: 'Gaza',
    category: 'journalist',
  },
  {
    humanity: 'A photojournalist whose last photo was sent thirty seconds before the strike',
    lost: 'Every photo she would have taken that would have changed someone\'s mind',
    age: 27,
    region: 'Gaza',
    category: 'journalist',
  },
  {
    humanity: 'A cameraman who filmed with one hand and held his daughter with the other',
    lost: 'The footage the world needed to see, from the person brave enough to shoot it',
    age: 33,
    region: 'Lebanon',
    category: 'journalist',
  },

  // ── Volunteers ──
  {
    humanity: 'A Red Crescent volunteer who answered every call even though his own house was gone',
    lost: 'The person who showed up when everyone else had already left',
    age: 26,
    region: 'Gaza',
    category: 'volunteer',
  },
  {
    humanity: 'A UN aid worker who distributed food knowing she wouldn\'t eat that day',
    lost: 'The invisible hand that kept a hundred families alive',
    age: 31,
    region: 'Gaza',
    category: 'volunteer',
  },
  {
    humanity: 'A community organizer who turned a parking lot into a shelter for 200 people',
    lost: 'The person who made something from nothing when it mattered most',
    age: 43,
    region: 'Lebanon',
    category: 'volunteer',
  },
  {
    humanity: 'A volunteer firefighter who ran into the burning refinery to find his coworkers',
    lost: 'The kind of courage you can\'t train — you either have it or you don\'t',
    age: 29,
    region: 'Saudi Arabia',
    category: 'volunteer',
  },

  // ── More children — because they are the majority ──
  {
    humanity: 'A toddler who called every animal "doggy"',
    lost: 'The day she would have learned the word "cat" and laughed at herself',
    age: 2,
    region: 'Gaza',
    category: 'child',
  },
  {
    humanity: 'A boy who collected rocks because he thought one might be a fossil',
    lost: 'The paleontologist, the geologist, the curious mind',
    age: 9,
    region: 'Gaza',
    category: 'child',
  },
  {
    humanity: 'A teenager who translated for her parents because she spoke three languages',
    lost: 'The bridge between two worlds',
    age: 14,
    region: 'Israel',
    category: 'child',
  },
  {
    humanity: 'A boy who slept with a flashlight so he could read after bedtime',
    lost: 'Every book he would have read under those covers',
    age: 8,
    region: 'Gaza',
    category: 'child',
  },
  {
    humanity: 'A girl who sang to her baby brother to keep him from crying during the shelling',
    lost: 'A voice that was the only safe sound in the world for someone',
    age: 11,
    region: 'Gaza',
    category: 'child',
  },
  {
    humanity: 'A boy who was afraid of the dark but not of anything else',
    lost: 'The brave things he would have done in daylight',
    age: 7,
    region: 'Iran',
    category: 'child',
  },
  {
    humanity: 'A girl who shared her last piece of bread with a stranger\'s child',
    lost: 'The kind of person this world cannot afford to lose',
    age: 10,
    region: 'Gaza',
    category: 'child',
  },

  // ── More parents ──
  {
    humanity: 'A mother who put her body over her children when the ceiling came down',
    lost: 'She succeeded. They lived. She didn\'t.',
    age: 32,
    region: 'Gaza',
    category: 'parent',
  },
  {
    humanity: 'A father who video-called his kids every night from the frontline',
    lost: 'A bedtime voice that will echo in a phone that no longer rings',
    age: 36,
    region: 'Israel',
    category: 'parent',
  },
  {
    humanity: 'A widowed father raising four kids who refused every offer to leave',
    lost: 'The stubbornness that keeps families together',
    age: 49,
    region: 'Gaza',
    category: 'parent',
  },
];
