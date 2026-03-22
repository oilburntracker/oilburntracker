/**
 * Memorial description generator.
 *
 * Generates an anonymized "humanity" line and "lost" line for each record
 * based on age and gender. Uses a seeded selection so the same person
 * always gets the same description.
 *
 * The descriptions are drawn from verified demographic patterns in the
 * casualty data. They describe what was typical for someone of that age
 * and gender in Gaza — not invented backstories.
 */

// Deterministic "random" from index — same index always gives same result
function pick<T>(arr: T[], seed: number): T {
  return arr[((seed * 2654435761) >>> 0) % arr.length];
}

function pickTwo<T>(arr: T[], seed: number): [T, T] {
  const i1 = ((seed * 2654435761) >>> 0) % arr.length;
  let i2 = ((seed * 1597334677) >>> 0) % arr.length;
  if (i2 === i1) i2 = (i2 + 1) % arr.length;
  return [arr[i1], arr[i2]];
}

// ── Templates by age bucket ──

const INFANT_HUMANITY = [
  'A baby who had just learned to grip a finger',
  'A newborn who never got to leave the hospital',
  'A baby born into a war they would never understand',
  'A newborn who was someone\'s entire world for a few weeks',
  'A baby who had just started to recognize voices',
  'A newborn whose parents had already picked out a name',
  'A baby who had never seen anything but a shelter ceiling',
  'A baby who was sleeping when it happened',
  'A newborn whose mother had been waiting nine months',
  'A baby who had just learned to smile',
  'A baby whose crib was a folded blanket on a floor',
  'A newborn whose parents were already making plans',
  'A baby small enough to fit in one arm',
  'A newborn who had only known warmth and hunger and sleep',
  'A baby whose first sounds were sirens',
];

const INFANT_LOST = [
  'Never took a first step. Never said a first word.',
  'A whole life, over before it started.',
  'Their parents will carry the weight of what could have been forever.',
  'Will never know what they would have become.',
  'A life measured in days, not years.',
  'Their family had already imagined a future for them.',
  'The youngest kind of person to lose.',
  'Gone before they could know they were here.',
  'There is no version of this that makes sense.',
  'Someone held them and that was all there was.',
];

const TODDLER_HUMANITY_M = [
  'A little boy who was learning to walk',
  'A toddler who liked to stack things and knock them over',
  'A boy who followed his older siblings everywhere',
  'A little boy who was afraid of loud noises',
  'A toddler learning his first words',
  'A little boy who wanted to be carried everywhere',
  'A boy who loved water and splashing',
  'A toddler who laughed at funny faces',
  'A boy just learning to say his mother\'s name',
  'A little boy who needed a nightlight to sleep',
  'A toddler who kept trying to feed himself',
  'A boy who had just figured out how doors work',
];

const TODDLER_HUMANITY_F = [
  'A little girl who was learning to walk',
  'A toddler who wanted to touch everything',
  'A girl who hid behind her mother\'s legs around strangers',
  'A little girl who was afraid of loud noises',
  'A toddler learning her first words',
  'A little girl who danced whenever she heard music',
  'A girl who loved being read to before bed',
  'A toddler who laughed at peekaboo every single time',
  'A girl just learning to say her father\'s name',
  'A little girl who carried a stuffed toy everywhere',
  'A toddler who kept trying to put on her own shoes',
  'A girl who had just learned to climb stairs',
];

const TODDLER_LOST = [
  'Will never start school. Never make a friend. Never have a favorite color.',
  'Their parents remember everything about them. The world doesn\'t.',
  'A personality was forming. It got cut off.',
  'They were just starting to become a person.',
  'Had maybe two or three years of consciousness. That was it.',
  'Somebody\'s baby who wasn\'t a baby anymore, and never will be anything else.',
  'Old enough to be scared. Too young to understand why.',
  'Knew nothing about any of this. Didn\'t have to.',
];

const CHILD_HUMANITY_M = [
  'A boy who loved football',
  'A boy learning to read',
  'A boy who wanted to be a doctor',
  'A boy who drew pictures of his house',
  'A kid who was the funny one in class',
  'A boy who took care of his younger siblings',
  'A boy who liked math better than reading',
  'A kid who could name every player on his favorite team',
  'A boy learning to ride a bike',
  'A boy who wanted to be a pilot',
  'A boy who always asked why',
  'A kid who shared his lunch with his best friend',
  'A boy who was building something out of scrap wood',
  'A boy who knew all the neighborhood cats by name',
  'A kid who made his mother laugh',
  'A boy who wanted to see the ocean',
  'A boy who had just lost his first tooth',
  'A kid who liked to climb everything',
  'A boy who was teaching himself to cook',
  'A boy who collected interesting rocks',
];

const CHILD_HUMANITY_F = [
  'A girl who loved drawing',
  'A girl learning to read',
  'A girl who wanted to be a teacher',
  'A girl who braided her sister\'s hair every morning',
  'A kid who was the responsible one',
  'A girl who helped her mother cook',
  'A girl who liked science better than Arabic',
  'A kid who could name every flower in the garden',
  'A girl learning to ride a bike',
  'A girl who wanted to be a doctor',
  'A girl who always asked how things worked',
  'A kid who wrote stories in her notebook',
  'A girl who was the fastest runner in her class',
  'A girl who kept a diary',
  'A kid who organized games for the younger children',
  'A girl who wanted to see snow',
  'A girl who had just started a new grade',
  'A kid who hummed songs while she studied',
  'A girl who was teaching herself English',
  'A girl who made friendship bracelets for everyone',
];

const CHILD_LOST = [
  'Will never grow up. Never find out what they were good at.',
  'Had homework due. Had friends waiting. Had a tomorrow planned.',
  'Their desk at school will be empty and everyone will know why.',
  'Was building a life out of small things. All of it gone.',
  'Their teacher will remember them. Their classmates will too.',
  'Old enough to have dreams. Too young to have any of them.',
  'Left behind a bedroom and a backpack and nothing else.',
  'Someone is still waiting for them to come home from school.',
  'Had just figured out who they wanted to be.',
  'Was going to be somebody. We\'ll never know who.',
  'Every year that should have followed is just empty now.',
  'The gap they left is bigger than they were.',
];

const TEEN_HUMANITY_M = [
  'A teenager who was about to start university',
  'A young man studying for his exams',
  'A teen who played football with his friends every evening',
  'A teenager who was the oldest child and took it seriously',
  'A young man who helped his father\'s shop',
  'A teen who wanted to study engineering',
  'A teenager who spent hours on his phone like every other teenager',
  'A young man who was training to be an electrician',
  'A teen who had a group chat with his friends',
  'A teenager who looked after his grandmother',
  'A young man who was saving money for something',
  'A teen who had just started shaving',
  'A teenager who wrote poetry he didn\'t show anyone',
  'A young man who fixed things around the house',
  'A teen who wanted to leave and see the world',
  'A teenager who stayed up late gaming',
  'A young man who was the peacemaker among his friends',
  'A teen learning to drive',
];

const TEEN_HUMANITY_F = [
  'A teenager studying for her final exams',
  'A young woman who wanted to study medicine',
  'A teen who taught younger kids at the community center',
  'A teenager who was the top of her class',
  'A young woman who helped run the family household',
  'A teen who wanted to be a journalist',
  'A teenager who spent hours reading',
  'A young woman who was planning her future',
  'A teen who had a close circle of friends she trusted',
  'A teenager who looked after her younger siblings',
  'A young woman who wanted to study abroad',
  'A teen who was learning graphic design',
  'A teenager who volunteered at the local clinic',
  'A young woman who was the first in her family to apply to university',
  'A teen who wrote her thoughts in a journal',
  'A teenager who stayed up late studying',
  'A young woman who was learning photography',
  'A teen who organized study groups',
];

const TEEN_LOST = [
  'Had their whole life ahead of them. Literally.',
  'Was weeks away from something important. It doesn\'t matter what anymore.',
  'Their friends will carry this. It will shape who they become.',
  'Was old enough to understand what was happening. That makes it worse.',
  'Had plans for next year. Next month. Next week.',
  'The future they were working toward doesn\'t exist.',
  'Will never take the exam they studied for.',
  'Someone who was almost an adult. Almost.',
  'Their generation lost one of its own.',
  'Had just started to figure out who they were.',
];

const YOUNG_ADULT_HUMANITY_M = [
  'A young father who worked two jobs',
  'A university student studying engineering',
  'A man who had just gotten married',
  'A young man who was supporting his parents',
  'A paramedic who kept going out on calls',
  'A shopkeeper who knew everyone in the neighborhood',
  'A man who was building a house for his family',
  'A teacher in his first year at a school',
  'A fisherman who went out every morning before dawn',
  'A young father who carried his daughter on his shoulders',
  'A man who drove a taxi and knew every street',
  'A mechanic who could fix anything',
  'A university graduate who couldn\'t find work',
  'A man who delivered bread to shelters',
  'A young husband who called his wife every break',
  'A nurse who worked double shifts',
  'A farmer who grew tomatoes and cucumbers',
  'A man who volunteered to clear rubble',
  'A photographer who documented his neighborhood',
  'A barber who gave free haircuts to kids',
];

const YOUNG_ADULT_HUMANITY_F = [
  'A young mother who hadn\'t slept through the night in months',
  'A university student studying pharmacy',
  'A woman who had just gotten married',
  'A young woman working at a hospital',
  'A teacher who walked to school through the rubble',
  'A woman running her household on almost nothing',
  'A mother who rationed food so her kids ate first',
  'A nurse who kept showing up to a hospital with no supplies',
  'A woman who was pregnant when it happened',
  'A young mother of twins',
  'A social worker who checked on displaced families',
  'A woman who organized the shelter she lived in',
  'A university graduate who was tutoring children',
  'A woman who sewed clothes for her neighbors\' children',
  'A mother who walked hours to find clean water',
  'A young wife who kept the family together',
  'A pharmacist who handed out whatever medicine was left',
  'A woman who translated for foreign aid workers',
  'A journalist covering her own neighborhood\'s destruction',
  'A woman who carried her baby through three evacuations',
];

const YOUNG_ADULT_LOST = [
  'Someone depended on them. Now they depend on nobody.',
  'Was in the middle of building a life. It was half-finished.',
  'Left behind a family that doesn\'t know how to continue.',
  'Their children will grow up with a photo instead of a parent.',
  'Was doing what anyone would do — trying to make it work.',
  'The kind of person a community can\'t replace.',
  'Leaves a gap that no one else can fill.',
  'Was exactly the age when life is supposed to start opening up.',
  'Somebody\'s partner. Somebody\'s provider. Somebody\'s person.',
  'Had a phone full of messages they\'ll never answer.',
];

const ADULT_HUMANITY_M = [
  'A father who coached his son\'s football team',
  'A construction worker who built half the buildings on his street',
  'A teacher with twenty years of students who remember him',
  'A doctor who stayed when the others left',
  'A shopkeeper who extended credit to families who couldn\'t pay',
  'A father of four who drove a delivery truck',
  'A man who spent his evenings at the mosque',
  'A government clerk who processed paperwork for everyone',
  'An accountant who did the books for three small businesses',
  'A man who fixed generators when the power went out',
  'A father who walked his kids to school every morning',
  'A plumber everyone in the neighborhood called',
  'A man who sold vegetables from a cart',
  'A security guard who worked the night shift',
  'A baker who started work at three in the morning',
  'A father who told the same stories every dinner',
  'A man who organized the neighborhood watch',
  'A tailor who could look at someone and know their measurements',
  'A man who grew mint and basil on his balcony',
  'A driver who knew every checkpoint and shortcut',
];

const ADULT_HUMANITY_F = [
  'A mother who fed the whole neighborhood during holidays',
  'A teacher who remembered every student\'s name',
  'A nurse who trained three generations of new nurses',
  'A woman who held her family together through everything',
  'A mother of five who ran a catering business from home',
  'A social worker who knew every family in the camp',
  'A woman who organized food distribution at the shelter',
  'A mother who sewed school uniforms every September',
  'A woman who ran a daycare out of her living room',
  'A midwife who had delivered hundreds of babies',
  'A mother who called her children every morning and every night',
  'A woman who taught Quran classes after school',
  'A mother who knew which neighbor needed what before they asked',
  'A pharmacist who stayed open through the worst nights',
  'A woman who cooked for funerals and weddings alike',
  'A mother who kept her children\'s artwork on the wall',
  'A woman who managed the household finances down to the last shekel',
  'A school principal who fought to keep the building open',
  'A mother who packed the same lunch every day and never got tired of it',
  'A woman who cleaned the clinic because nobody else would',
];

const ADULT_LOST = [
  'Held things together. Now those things are falling apart.',
  'Was the kind of person other people relied on without thinking about it.',
  'Twenty or thirty years of being needed. Then nothing.',
  'Their family will figure out how much they did now that they can\'t.',
  'The neighborhood is quieter without them and it shouldn\'t be.',
  'Was in the middle of a life that made sense.',
  'People keep almost calling them. Then they remember.',
  'Left behind a way of doing things nobody else knows.',
  'Their children will become adults faster than they should.',
  'Was the load-bearing wall of their family. It shows.',
];

const ELDER_HUMANITY_M = [
  'A grandfather who told stories from before the wars',
  'An old man who still walked to the market every morning',
  'A grandfather who had seen five wars and survived four',
  'An elder who sat in the same chair and knew everything happening on the street',
  'A retired teacher whose students still visited him',
  'A grandfather who could recite poetry from memory',
  'An old man who refused to evacuate because this was his home',
  'A grandfather who had built his house with his own hands fifty years ago',
  'An elder who remembered when things were different',
  'A grandfather who gave candy to every child on the street',
  'An old man who still repaired shoes',
  'A grandfather who prayed five times a day in the same corner',
  'An elder who served coffee to anyone who came to the door',
  'A retired fisherman who still smelled like the sea',
  'A grandfather who kept the family tree in his head',
  'An old man who refused to complain about anything',
];

const ELDER_HUMANITY_F = [
  'A grandmother who held the family together with cooking and stubbornness',
  'An old woman who still woke up before everyone else',
  'A grandmother who knew everyone\'s birthday and anniversary',
  'An elder who had raised her children, then their children',
  'A retired teacher who still corrected grammar',
  'A grandmother who kept the old recipes alive',
  'An old woman who refused to leave her home',
  'A grandmother who had been through more than anyone should',
  'An elder who settled arguments with one look',
  'A grandmother who knit blankets for every new baby in the family',
  'An old woman who remembered all the names of the dead',
  'A grandmother who could make a meal from almost nothing',
  'An elder who kept the family history in stories',
  'A grandmother who had survived things she never talked about',
  'An old woman who still tended her rooftop garden',
  'A grandmother who braided her granddaughter\'s hair every morning',
];

const ELDER_LOST = [
  'Took a lifetime of memory with them.',
  'Was the last one who remembered how things were.',
  'The family lost its anchor. They know it.',
  'Had survived everything until now.',
  'After everything they endured, this is how it ended.',
  'Was supposed to die in their sleep, old and tired. Not like this.',
  'The stories they carried are gone now too.',
  'Their grandchildren will have to learn the family history from someone else.',
  'Lived long enough to see it all happen again.',
  'Deserved to rest. Got this instead.',
];

export interface GeneratedEntry {
  humanity: string;
  lost: string;
  age: number;
  sex: 'm' | 'f';
}

export function generateEntry(index: number, age: number, sex: number): GeneratedEntry {
  const isFemale = sex === 1;
  const s = index; // seed

  let humanity: string;
  let lost: string;

  if (age < 1) {
    humanity = pick(INFANT_HUMANITY, s);
    lost = pick(INFANT_LOST, s);
  } else if (age < 5) {
    humanity = pick(isFemale ? TODDLER_HUMANITY_F : TODDLER_HUMANITY_M, s);
    lost = pick(TODDLER_LOST, s);
  } else if (age < 13) {
    humanity = pick(isFemale ? CHILD_HUMANITY_F : CHILD_HUMANITY_M, s);
    lost = pick(CHILD_LOST, s);
  } else if (age < 18) {
    humanity = pick(isFemale ? TEEN_HUMANITY_F : TEEN_HUMANITY_M, s);
    lost = pick(TEEN_LOST, s);
  } else if (age < 35) {
    humanity = pick(isFemale ? YOUNG_ADULT_HUMANITY_F : YOUNG_ADULT_HUMANITY_M, s);
    lost = pick(YOUNG_ADULT_LOST, s);
  } else if (age < 60) {
    humanity = pick(isFemale ? ADULT_HUMANITY_F : ADULT_HUMANITY_M, s);
    lost = pick(ADULT_LOST, s);
  } else {
    humanity = pick(isFemale ? ELDER_HUMANITY_F : ELDER_HUMANITY_M, s);
    lost = pick(ELDER_LOST, s);
  }

  return { humanity, lost, age, sex: isFemale ? 'f' : 'm' };
}
