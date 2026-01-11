#!/usr/bin/env node
/**
 * Add metadata to kanji files
 */

const fs = require('fs');
const path = require('path');

function addMetadataToKanji(filePath, jlptLevel, itemCount) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Check if already wrapped with meta
  if (data.meta && data.kanji) {
    console.log(`⏭️  ${filePath} already has metadata, skipping`);
    return;
  }

  // Add metadata
  const output = {
    meta: {
      version: "1.0.0",
      type: "kanji",
      jlptLevel: jlptLevel,
      lastUpdated: "2026-01-11",
      itemCount: itemCount,
      contributors: ["gemini", "claude", "codex"],
      source: "JLPT official kanji lists"
    },
    kanji: data
  };

  fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
  console.log(`✅ Added metadata to ${filePath} (${itemCount} kanji)`);
}

// Add metadata to N5 and N4 kanji
const kanjiDir = path.join(__dirname, '../kanji');
addMetadataToKanji(path.join(kanjiDir, 'n5.json'), 'N5', 80);
addMetadataToKanji(path.join(kanjiDir, 'n4.json'), 'N4', 166);

console.log('✅ All kanji files updated with metadata');
