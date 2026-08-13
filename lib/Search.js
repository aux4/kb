import fs from "fs";
import path from "path";
import { readIndex } from "./Index.js";
import { walkEntries } from "./Walk.js";
import { tokenize, stem } from "./Stemmer.js";

// BM25 parameters (standard defaults).
const K1 = 1.2;
const B = 0.75;

// Field boosts: title/topic and tags weigh more than the body.
const FIELD_BOOST = {
  title: 3,
  tags: 2,
  body: 1
};

function termFrequencies(tokens) {
  const tf = new Map();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  return tf;
}

// Build the per-entry document model: title/topic, tags, and full body,
// each tokenized + stemmed. Reuses the index (topic/tags) and reads the
// markdown file for the body.
function buildDocuments(folder) {
  const index = readIndex(folder);
  const byFile = new Map();
  for (const entry of index) {
    if (entry && entry.file) {
      byFile.set(entry.file, entry);
    }
  }

  // Recurse the whole tree (root + arbitrary-depth page subfolders), excluding
  // every page-spine index.md. `file` is root-relative and `page` is the block's
  // parent folder ("" for root blocks).
  const entries = walkEntries(folder);
  const documents = [];

  for (const { file, page } of entries) {
    const filePath = path.join(folder, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    const entry = byFile.get(file);
    const title = entry && entry.topic ? entry.topic : path.basename(file).replace(/\.md$/, "");
    const tags = entry && entry.tags ? entry.tags : "";

    const fields = {
      title: termFrequencies(tokenize(title)),
      tags: termFrequencies(tokenize(tags)),
      body: termFrequencies(tokenize(content))
    };

    const length = fields.title.size + fields.tags.size + fields.body.size;

    documents.push({ file, page, title, tags, lines, fields, length });
  }

  return documents;
}

// Inverse document frequency for a term across the corpus (BM25 form).
function idf(term, documents) {
  let n = 0;
  for (const doc of documents) {
    if (doc.fields.title.has(term) || doc.fields.tags.has(term) || doc.fields.body.has(term)) {
      n++;
    }
  }
  const N = documents.length;
  return Math.log(1 + (N - n + 0.5) / (n + 0.5));
}

function bm25Score(queryTerms, doc, avgLength, idfCache, documents) {
  let score = 0;

  for (const term of queryTerms) {
    let termIdf = idfCache.get(term);
    if (termIdf === undefined) {
      termIdf = idf(term, documents);
      idfCache.set(term, termIdf);
    }
    if (termIdf <= 0) {
      continue;
    }

    // Boosted term frequency: sum each field's tf weighted by its boost.
    let tf = 0;
    tf += FIELD_BOOST.title * (doc.fields.title.get(term) || 0);
    tf += FIELD_BOOST.tags * (doc.fields.tags.get(term) || 0);
    tf += FIELD_BOOST.body * (doc.fields.body.get(term) || 0);

    if (tf === 0) {
      continue;
    }

    const norm = doc.length / avgLength || 1;
    const denom = tf + K1 * (1 - B + B * norm);
    score += termIdf * ((tf * (K1 + 1)) / denom);
  }

  return score;
}

// Produce matched-context lines (body) for a ranked entry, so consumers that
// grep the rendered output still see the file header + matched context. Body
// lines that contain any query stem are returned; if the match was title/tag
// only (no body line), a synthetic context line is returned so the entry still
// shows context.
function buildMatches(queryTerms, doc) {
  const querySet = new Set(queryTerms);
  const matches = [];
  const seen = new Set();

  for (let i = 0; i < doc.lines.length; i++) {
    const lineTokens = tokenize(doc.lines[i]);
    if (lineTokens.some(t => querySet.has(t))) {
      const context = [];
      if (i > 0) context.push(doc.lines[i - 1]);
      context.push(doc.lines[i]);
      if (i < doc.lines.length - 1) context.push(doc.lines[i + 1]);

      if (!seen.has(i)) {
        seen.add(i);
        matches.push({
          lineNumber: i + 1,
          line: doc.lines[i],
          context: context.join("\n")
        });
      }
    }
  }

  if (matches.length === 0) {
    // Title/tag-only match — synthesize a header line so the rendered output
    // still carries file + matched context for downstream consumers.
    const titleLine = doc.tags ? `${doc.title} [tags: ${doc.tags}]` : doc.title;
    matches.push({
      lineNumber: 1,
      line: titleLine,
      context: titleLine
    });
  }

  return matches;
}

export function search(folder, query) {
  if (!fs.existsSync(folder)) {
    return [];
  }

  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) {
    return [];
  }

  const documents = buildDocuments(folder);
  if (documents.length === 0) {
    return [];
  }

  const totalLength = documents.reduce((sum, doc) => sum + doc.length, 0);
  const avgLength = totalLength / documents.length || 1;

  const idfCache = new Map();
  const scored = [];

  for (const doc of documents) {
    const score = bm25Score(queryTerms, doc, avgLength, idfCache, documents);
    if (score > 0) {
      scored.push({ doc, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.map(({ doc, score }) => ({
    file: doc.file,
    score,
    matches: buildMatches(queryTerms, doc)
  }));
}

export { stem };
