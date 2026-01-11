# Japanese Learning Datasets

Unified, validated datasets for Japanese language learning applications. These datasets are maintained collaboratively by three AI agent implementations (Claude, Gemini, and Codex) working on web and mobile Japanese learning applications.

## 📦 Contents

- **Kana** (208 characters): Hiragana and Katakana with romaji
- **Kanji** (246 characters): JLPT N5 and N4 kanji with meanings and readings
- **Vocabulary** (1,386 words): JLPT N5 and N4 vocabulary with romaji and meanings

## 🗂️ Repository Structure

```
japanese-learning-datasets/
├── kana/
│   ├── hiragana.json (104 characters)
│   └── katakana.json (104 characters)
├── kanji/
│   ├── n5.json (80 kanji)
│   └── n4.json (166 kanji)
├── vocabulary/
│   ├── n5.json (718 words)
│   └── n4.json (668 words)
├── schema/
│   ├── export-schema.ts (Universal export format for user data)
│   └── examples/ (Integration examples)
├── scripts/
│   ├── convert-kana.js (Kana conversion script)
│   ├── convert-vocab.js (Vocabulary conversion script)
│   ├── add-kanji-metadata.js (Kanji metadata script)
│   └── validate.js (Dataset validation)
├── version.json (Dataset metadata and versioning)
├── CONVENTIONS.md (Field naming conventions)
└── README.md (this file)
```

## 🚀 Quick Start

### Integration via Git Submodule

```bash
# Add this repository as a submodule to your project
git submodule add https://github.com/YOUR_USERNAME/japanese-learning-datasets.git data/datasets

# Initialize and update
git submodule update --init --recursive
```

### Usage Example

```typescript
import hiraganaData from './data/datasets/kana/hiragana.json';
import n5Vocab from './data/datasets/vocabulary/n5.json';

// Access kana characters
const hiraganaChars = hiraganaData.characters; // 104 characters
console.log(hiraganaChars[0]);
// { character: "あ", romaji: ["a"], type: "basic" }

// Access vocabulary
const n5Words = n5Vocab.words; // 718 words
console.log(n5Words[0]);
// { word: "日", kana: "ひ", romaji: ["hi"], meaning: "day; sun", jlptLevel: "N5" }
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
    "jlptLevel": "N5",
    "lastUpdated": "2026-01-11",
    "itemCount": 80
  },
  "kanji": [
    {
      "character": "日",
      "meanings": ["day", "sun", "Japan"],
      "onyomi": ["nichi", "jitsu"],
      "kunyomi": ["hi", "ka"],
      "jlptLevel": "N5"
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
    "jlptLevel": "N5",
    "lastUpdated": "2026-01-11",
    "itemCount": 718
  },
  "words": [
    {
      "word": "お腹",
      "kana": "おなか",
      "romaji": ["onaka"],
      "meaning": "stomach",
      "jlptLevel": "N5"
    }
  ]
}
```

## 🔑 Field Naming Convention: romaji vs romanji

**IMPORTANT**: This repository uses **"romaji"** (correct English spelling) in all datasets.

### For Applications Using "romanji" Internally

If your application uses `romanji` in its internal data structures, use an adapter:

```typescript
// Adapter for backward compatibility
function importKana(publicData: typeof hiraganaData) {
  return publicData.characters.map(char => ({
    ...char,
    romanji: char.romaji, // Map romaji → romanji
    romaji: undefined     // Remove romaji field
  }));
}

// Usage
const internalData = importKana(hiraganaData);
// Now uses: { character: "あ", romanji: ["a"], type: "basic" }
```

See `CONVENTIONS.md` for detailed mapping examples.

## ✅ Data Quality

All datasets have been:

- ✅ Validated for consistency and completeness
- ✅ Corrected for doubled consonant errors (gemini/claude collaboration)
- ✅ Verified against JLPT official sources
- ✅ Field names standardized to "romaji"

Run validation:

```bash
npm run validate
# or
node scripts/validate.js
```

## 🤝 Contributing

This repository is maintained collaboratively by three AI implementations:

- **Claude**: Web application (`/projects/japanese`)
- **Gemini**: Mobile application (`/projects/japanese-mobile-gemini`)
- **Codex**: Mobile application (`/projects/japanese-mobile-codex`)

### Update Process

1. Make changes to datasets in your local application
2. Run validation: `node scripts/validate.js`
3. Submit pull request with detailed change description
4. Requires approval from at least one other implementation

## 📊 Dataset Verification

| Dataset | Expected Count | Actual Count | Status |
|---------|----------------|--------------|--------|
| Hiragana | 104 | 104 | ✅ |
| Katakana | 104 | 104 | ✅ |
| Kanji N5 | 80 | 80 | ✅ |
| Kanji N4 | 166 | 166 | ✅ |
| Vocab N5 | 718 | 718 | ✅ |
| Vocab N4 | 668 | 668 | ✅ |

## 🔄 Version History

### 1.0.0 (2026-01-11)

- Initial release with validated datasets
- Fixed doubled consonants in vocabulary
- Fixed triple-n errors
- Standardized field naming to "romaji"
- Added comprehensive metadata

## 📄 License

MIT License - See LICENSE file for details

## 🙋 Support

For issues or questions:
- Open an issue in this repository
- Contact the maintaining implementations

---

**Last Updated**: 2026-01-11
**Maintained by**: Claude, Gemini, and Codex AI implementations
