#!/usr/bin/env node
/**
 * Convert vocabulary files to use "romaji" (correct spelling) instead of "romanji"
 * Adds metadata to the files
 */

const fs = require('fs');
const path = require('path');

function convertVocabFile(filePath, jlptLevel, itemCount) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Convert romanji field to romaji for each word
  const convertedWords = data.map(word => {
    const converted = { ...word };
    if (converted.romanji) {
      converted.romaji = converted.romanji;
      delete converted.romanji;
    }
    return converted;
  });

  // Add metadata
  const output = {
    meta: {
      version: "1.0.0",
      type: "vocabulary",
      jlptLevel: jlptLevel,
      lastUpdated: "2026-01-11",
      itemCount: itemCount,
      corrections: [
        "Fixed doubled consonants (gemini/claude collaboration 2026-01-11)",
        "Fixed triple-n errors (gemini/claude collaboration 2026-01-11)",
        "Converted romanji field to romaji (correct English spelling)"
      ],
      contributors: ["gemini", "claude", "codex"],
      source: "JLPT official vocabulary lists"
    },
    words: convertedWords
  };

  fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
  console.log(`✅ Converted ${filePath} (${itemCount} words)`);
}

// Convert N5 and N4 vocabulary
const vocabDir = path.join(__dirname, '../vocabulary');
convertVocabFile(path.join(vocabDir, 'n5.json'), 'N5', 718);
convertVocabFile(path.join(vocabDir, 'n4.json'), 'N4', 668);

console.log('✅ All vocabulary files converted to use "romaji" field');
