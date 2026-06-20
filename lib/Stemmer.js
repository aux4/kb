// Minimal Porter stemmer (Porter 1980) — no external dependencies.
// Collapses morphological variants to a common stem so that, e.g.,
// "preference", "prefers", "preferences" and "preferred" share a stem.

const step2list = {
  ational: "ate",
  tional: "tion",
  enci: "ence",
  anci: "ance",
  izer: "ize",
  bli: "ble",
  alli: "al",
  entli: "ent",
  eli: "e",
  ousli: "ous",
  ization: "ize",
  ation: "ate",
  ator: "ate",
  alism: "al",
  iveness: "ive",
  fulness: "ful",
  ousness: "ous",
  aliti: "al",
  iviti: "ive",
  biliti: "ble",
  logi: "log"
};

const step3list = {
  icate: "ic",
  ative: "",
  alize: "al",
  iciti: "ic",
  ical: "ic",
  ful: "",
  ness: ""
};

const c = "[^aeiou]";
const v = "[aeiouy]";
const C = c + "[^aeiouy]*";
const V = v + "[aeiou]*";

const mgr0 = new RegExp("^(" + C + ")?" + V + C);
const meq1 = new RegExp("^(" + C + ")?" + V + C + "(" + V + ")?$");
const mgr1 = new RegExp("^(" + C + ")?" + V + C + V + C);
const sV = new RegExp("^(" + C + ")?" + v);

export function stem(word) {
  if (!word || word.length < 3) {
    return word;
  }

  let w = word;
  let firstch = w.substring(0, 1);
  if (firstch === "y") {
    w = firstch.toUpperCase() + w.substring(1);
  }

  let re;
  let re2;
  let re3;
  let re4;

  // Step 1a
  re = /^(.+?)(ss|i)es$/;
  re2 = /^(.+?)([^s])s$/;
  if (re.test(w)) {
    w = w.replace(re, "$1$2");
  } else if (re2.test(w)) {
    w = w.replace(re2, "$1$2");
  }

  // Step 1b
  re = /^(.+?)eed$/;
  re2 = /^(.+?)(ed|ing)$/;
  if (re.test(w)) {
    const fp = re.exec(w);
    re = new RegExp("^(" + C + ")?" + V + C);
    if (re.test(fp[1])) {
      w = w.replace(/.$/, "");
    }
  } else if (re2.test(w)) {
    const fp = re2.exec(w);
    const stemPart = fp[1];
    re2 = sV;
    if (re2.test(stemPart)) {
      w = stemPart;
      re2 = /(at|bl|iz)$/;
      re3 = new RegExp("([^aeiouylsz])\\1$");
      re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");
      if (re2.test(w)) {
        w = w + "e";
      } else if (re3.test(w)) {
        w = w.replace(/.$/, "");
      } else if (re4.test(w)) {
        w = w + "e";
      }
    }
  }

  // Step 1c
  re = /^(.+?)y$/;
  if (re.test(w)) {
    const fp = re.exec(w);
    const stemPart = fp[1];
    re = sV;
    if (re.test(stemPart)) {
      w = stemPart + "i";
    }
  }

  // Step 2
  re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
  if (re.test(w)) {
    const fp = re.exec(w);
    const stemPart = fp[1];
    const suffix = fp[2];
    re = mgr0;
    if (re.test(stemPart)) {
      w = stemPart + step2list[suffix];
    }
  }

  // Step 3
  re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
  if (re.test(w)) {
    const fp = re.exec(w);
    const stemPart = fp[1];
    const suffix = fp[2];
    re = mgr0;
    if (re.test(stemPart)) {
      w = stemPart + step3list[suffix];
    }
  }

  // Step 4
  re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
  re2 = /^(.+?)(s|t)(ion)$/;
  if (re.test(w)) {
    const fp = re.exec(w);
    const stemPart = fp[1];
    re = mgr1;
    if (re.test(stemPart)) {
      w = stemPart;
    }
  } else if (re2.test(w)) {
    const fp = re2.exec(w);
    const stemPart = fp[1] + fp[2];
    re2 = mgr1;
    if (re2.test(stemPart)) {
      w = stemPart;
    }
  }

  // Step 5
  re = /^(.+?)e$/;
  if (re.test(w)) {
    const fp = re.exec(w);
    const stemPart = fp[1];
    re = mgr1;
    re2 = meq1;
    re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
    if (re.test(stemPart) || (re2.test(stemPart) && !re3.test(stemPart))) {
      w = stemPart;
    }
  }

  re = /ll$/;
  re2 = mgr1;
  if (re.test(w) && re2.test(w)) {
    w = w.replace(/.$/, "");
  }

  // Turn initial Y back to y
  if (firstch === "y") {
    w = firstch.toLowerCase() + w.substring(1);
  }

  return w;
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "was",
  "were",
  "will",
  "with"
]);

// Lowercase, strip punctuation, split on non-alphanumerics, drop stop words,
// then stem each remaining token.
export function tokenize(text) {
  if (!text) {
    return [];
  }

  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 0 && !STOP_WORDS.has(t))
    .map(stem);
}
