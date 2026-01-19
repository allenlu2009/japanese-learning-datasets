#!/usr/bin/env node
/**
 * Validation script for Japanese learning datasets
 * Verifies data integrity and field naming conventions
 */

const fs = require('fs');
const path = require('path');

let errors = 0;
let warnings = 0;

function error(msg) {
  console.error(`❌ ERROR: ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`⚠️  WARNING: ${msg}`);
  warnings++;
}

function success(msg) {
  console.log(`✅ ${msg}`);
}

// Validate kana files
function validateKana(type) {
  const filePath = path.join(__dirname, '../kana', `${type}.json`);

  if (!fs.existsSync(filePath)) {
    error(`${type}.json not found`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Check metadata
  if (!data.meta) {
    error(`${type}.json missing meta object`);
    return;
  }

  if (data.meta.itemCount !== 104) {
    error(`${type}.json itemCount should be 104, got ${data.meta.itemCount}`);
  }

  // Check characters
  if (!Array.isArray(data.characters)) {
    error(`${type}.json missing characters array`);
    return;
  }

  if (data.characters.length !== 104) {
    error(`${type}.json should have 104 characters, got ${data.characters.length}`);
  }

  // Check each character uses "romaji" not "romanji"
  data.characters.forEach((char, i) => {
    if (char.romanji) {
      error(`${type}.json character ${i} uses "romanji" field (should be "romaji")`);
    }
    if (!char.romaji) {
      error(`${type}.json character ${i} missing "romaji" field`);
    }
    if (!Array.isArray(char.romaji)) {
      error(`${type}.json character ${i} romaji should be an array`);
    }
  });

  success(`${type}.json validated (${data.characters.length} characters)`);
}

// Validate kanji files
function validateKanji(level, expectedCount) {
  const filePath = path.join(__dirname, '../kanji', `${level}.json`);

  if (!fs.existsSync(filePath)) {
    error(`kanji/${level}.json not found`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!data.meta) {
    error(`kanji/${level}.json missing meta object`);
    return;
  }

  if (data.meta.itemCount !== expectedCount) {
    error(`kanji/${level}.json itemCount should be ${expectedCount}, got ${data.meta.itemCount}`);
  }

  if (!Array.isArray(data.kanji)) {
    error(`kanji/${level}.json missing kanji array`);
    return;
  }

  if (data.kanji.length !== expectedCount) {
    error(`kanji/${level}.json should have ${expectedCount} kanji, got ${data.kanji.length}`);
  }

  success(`kanji/${level}.json validated (${data.kanji.length} kanji)`);
}

// Validate vocabulary files
function validateVocabulary(level, expectedCount) {
  const filePath = path.join(__dirname, '../vocabulary', `${level}.json`);

  if (!fs.existsSync(filePath)) {
    error(`vocabulary/${level}.json not found`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!data.meta) {
    error(`vocabulary/${level}.json missing meta object`);
    return;
  }

  if (data.meta.itemCount !== expectedCount) {
    error(`vocabulary/${level}.json itemCount should be ${expectedCount}, got ${data.meta.itemCount}`);
  }

  if (!Array.isArray(data.words)) {
    error(`vocabulary/${level}.json missing words array`);
    return;
  }

  if (data.words.length !== expectedCount) {
    error(`vocabulary/${level}.json should have ${expectedCount} words, got ${data.words.length}`);
  }

  // Check each word uses "romaji" not "romanji"
  let romanjiCount = 0;
  data.words.forEach((word, i) => {
    if (word.romanji) {
      romanjiCount++;
    }
    if (!word.romaji) {
      error(`vocabulary/${level}.json word ${i} (${word.word}) missing "romaji" field`);
    }
  });

  if (romanjiCount > 0) {
    error(`vocabulary/${level}.json has ${romanjiCount} words using "romanji" field (should be "romaji")`);
  }

  success(`vocabulary/${level}.json validated (${data.words.length} words)`);
}

// Run all validations
console.log('🔍 Validating Japanese Learning Datasets...\n');

validateKana('hiragana');
validateKana('katakana');
validateKanji('n5', 80);
validateKanji('n4', 166);
validateKanji('n3', 367);
validateKanji('n2', 367);
validateKanji('n1', 1232);
validateVocabulary('n5', 718);
validateVocabulary('n4', 668);
validateVocabulary('n3', 2139);
validateVocabulary('n2', 1748);
validateVocabulary('n1', 2699);

console.log('\n📊 Validation Summary:');
console.log(`   Errors: ${errors}`);
console.log(`   Warnings: ${warnings}`);

if (errors === 0 && warnings === 0) {
  console.log('\n🎉 All validations passed!');
  process.exit(0);
} else if (errors === 0) {
  console.log('\n✅ Validation passed with warnings');
  process.exit(0);
} else {
  console.log('\n❌ Validation failed');
  process.exit(1);
}
