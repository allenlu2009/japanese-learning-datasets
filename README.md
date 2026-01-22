# Japanese Learning Datasets

Unified, validated datasets for Japanese language learning applications. These datasets are maintained collaboratively by three AI agent implementations (Claude, Gemini, and Codex) working on web and mobile Japanese learning applications.

## 📦 Contents

The repository now covers the **full JLPT spectrum (N5 through N1)**.

- **Kana** (208 characters): Hiragana and Katakana with romaji
- **Kanji** (2,212 characters): JLPT N5-N1 kanji with meanings and readings
- **Vocabulary** (7,972 words): JLPT N5-N1 vocabulary with romaji and meanings

## 🗂️ Repository Structure

```
japanese-learning-datasets/
├── kana/
│   ├── hiragana.json (104 characters)
│   └── katakana.json (104 characters)
├── kanji/
│   ├── n5.json (80 kanji)
│   ├── n4.json (166 kanji)
│   ├── n3.json (367 kanji)
│   ├── n2.json (367 kanji)
│   └── n1.json (1,232 kanji)
├── vocabulary/
│   ├── n5.json (718 words)
│   ├── n4.json (668 words)
│   ├── n3.json (2,139 words)
│   ├── n2.json (1,748 words)
│   └── n1.json (2,699 words)
├── schema/
│   ├── export-schema.ts (Universal export format for user data)
│   └── examples/ (Integration examples)
├── scripts/
│   ├── validate.js (Dataset validation)
│   └── convert-*.js (Conversion utilities)
├── version.json (Dataset metadata and versioning)
├── CONVENTIONS.md (Field naming conventions)
└── README.md (this file)
```

## 🚀 Quick Start

### Integration via Git Submodule

```bash
# Add this repository as a submodule to your project
git submodule add https://github.com/allenlu2009/japanese-learning-datasets.git data/datasets

# Initialize and update
git submodule update --init --recursive
```

### Usage Example

```typescript
import hiraganaData from './data/datasets/kana/hiragana.json';
import n3Vocab from './data/datasets/vocabulary/n3.json';

// Access kana characters
const hiraganaChars = hiraganaData.characters; // 104 characters
console.log(hiraganaChars[0]);
// { character: "あ", romaji: ["a"], type: "basic" }

// Access vocabulary
const n3Words = n3Vocab.words;
console.log(n3Words[0]);
// { word: "作法", kana: "さほう", romaji: ["sahou"], meaning: "manners", jlptLevel: "N3" }
```

## 📋 Data Format

### Kana (Hiragana/Katakana)

```json
{
  "meta": {
    "version": "1.0.0",
    "type": "hiragana",
    "lastUpdated": "2026-01-11",
    "itemCount": 104,
    "breakdown": { "basic": 46, "dakuten": 25, "combo": 33 }
  },
  "characters": [
    {
      "character": "あ",
      "romaji": ["a"],
      "type": "basic"
    }
  ]
}
```

### Kanji

```json
{
  "meta": {
    "version": "1.0.0",
    "type": "kanji",
    "jlptLevel": "N3",
    "lastUpdated": "2026-01-18",
    "itemCount": 367
  },
  "kanji": [
    {
      "character": "日",
      "meanings": ["day", "sun", "Japan"],
      "onyomi": ["nichi", "jitsu"],
      "kunyomi": ["hi", "ka"],
      "jlptLevel": "N3"
    }
  ]
}
```

### Vocabulary

```json
{
  "meta": {
    "version": "1.0.0",
    "type": "vocabulary",
    "jlptLevel": "N3",
    "lastUpdated": "2026-01-18",
    "itemCount": 2139
  },
  "words": [
    {
      "word": "お腹",
      "kana": "おなか",
      "romaji": ["onaka"],
      "meaning": "stomach",
      "jlptLevel": "N3"
    }
  ]
}
```
