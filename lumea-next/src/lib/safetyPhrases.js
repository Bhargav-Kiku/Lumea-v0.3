/**
 * A comprehensive library of over 100 phrases associated with self-harm, suicidal ideation, and extreme distress.
 * This list is used to trigger Lumea's safety de-escalation modal.
 */
export const safetyPhrases = [
  // Explicit Suicide references
  "kill myself", "suicide", "end it all", "end my life", "want to die", 
  "commit suicide", "take my own life", "take my life", "kms", "slit my wrists",
  "cut my wrists", "slash my wrists", "hang myself", "overdose", "poison myself",
  "kill my self", "killing myself", "committing suicide", "ending it all",
  
  // Hopelessness and Despair
  "better off dead", "wish i was dead", "let me die", "don't want to live",
  "don't wanna live", "can't live like this", "suicidial", "sucidial", "suiside",
  "going to end it", "no point in living", "nothing to live for", "suicidal thoughts", 
  "suicidal ideation", "prefer to be dead", "rather be dead", "wanting to die", "i want death",
  "life is done", "quitting life", "saying bye to life", "give up on life", "can't go on",
  "no reason to live", "i'm done with life", "world is better off without me",
  "everyone would be happier if i died", "wanna disappear", "want to disappear forever",
  
  // Self-Harm Methods
  "take a bunch of pills", "pills to end it", "swallowing pills",
  "jump off a bridge", "jump off the roof", "jump in front of a train",
  "drive off a cliff", "bullet in my head", "shoot myself", "kms now",
  "hanging from a rope", "rope around my neck", "strangle myself", "suffocate myself",
  "drown myself", "starve to death", "bleed out", "blood everywhere",
  "cut myself", "burning myself", "hurt myself", "punish myself", "drink bleach",
  
  // Finality and Goodbyes
  "death is the only way", "dying today", "i will die tonight", "die alone",
  "final goodbye", "saying goodbye forever", "leaving this world", "won't be here",
  "last message", "last post", "final note", "suicide note", "suicide letter",
  "i am gone", "i'm going away forever", "everything is over", "this is the end", 
  "final hour", "last breath",
  
  // Planning
  "planning my death", "how to kill myself", "ways to die", "best way to die",
  "painless suicide", "easy way to end it", "permanent solution", "making it stop",
  "stop the pain permanently", "rest forever", "eternal sleep", "never waking up",
  "don't wanna wake up", "won't wake up", "kms tonight", "kms today", 
  "ready to die", "prepare to die", "dying soon", "death beckons", "embracing death", 
  "going to kill myself", "will kill myself", "planning to kill myself", "decided to die", 
  "death is coming", "welcome death", "dying is easy", "buying a gun", "getting a rope",
  "writing my will", "giving my stuff away", "tying up loose ends",
  
  // Variations & Slang
  "commit sudoku", "unalive myself", "un-alive", "catch the bus", "toaster bath"
];

/**
 * Normalizes text to counter "leetspeak" obfuscation
 * e.g., "k!ll mys3lf" -> "kill myself"
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[0o]/g, 'o')
    .replace(/[3]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/[@4]/g, 'a')
    .replace(/[$5]/g, 's')
    .replace(/[7+]/g, 't')
    .replace(/[^a-z\s]/g, ''); // strip remaining punctuation
}

/**
 * Calculates the Levenshtein distance between two strings
 * Wagner-Fischer algorithm (O(N*M))
 */
function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[a.length][b.length];
}

/**
 * Helper to check for a match using fuzzy string matching and Leetspeak normalizer
 */
export const isDistressDetected = (text) => {
  if (!text) return false;
  
  const normalizedText = normalizeText(text);
  
  // 1. Check for exact substring match first (fastest)
  if (safetyPhrases.some(phrase => normalizedText.includes(phrase.toLowerCase()))) {
    return true;
  }
  
  // 2. Fuzzy matching (Levenshtein Distance)
  // We tokenize the input into words and check distance against single-word or short safety phrases
  const tokens = normalizedText.split(/\s+/);
  
  for (let phrase of safetyPhrases) {
    const phraseTokens = phrase.toLowerCase().split(/\s+/);
    
    // For single-word safety triggers (like "suicide", "kms", "overdose")
    if (phraseTokens.length === 1) {
      for (let token of tokens) {
        // If the word is at least 4 letters, allow 1 typo. If >= 7 letters, allow 2 typos.
        const allowedDistance = token.length >= 7 ? 2 : (token.length >= 4 ? 1 : 0);
        if (allowedDistance > 0 && Math.abs(token.length - phrase.length) <= allowedDistance) {
          if (levenshteinDistance(token, phrase) <= allowedDistance) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
};
