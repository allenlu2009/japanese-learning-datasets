# Field Naming Conventions

## Romaji vs Romanji

This repository uses **"romaji"** (correct English spelling) in all public datasets.

### Background

- **Correct English**: "romaji" (ローマ字)
- **Common Typo**: "romanji" (incorrect but used in some implementations)

### Convention

| Context | Field Name | Example |
|---------|-----------|---------|
| **Public Datasets** | `romaji` | `{ "character": "あ", "romaji": ["a"] }` |
| **Internal Apps** | `romanji` or `romaji` | Implementation-specific |
| **User-Facing UI** | "romaji" | "Type romaji here..." |

## Integration Examples

### Example 1: Direct Usage (New Applications)

```typescript
import hiraganaData from './datasets/kana/hiragana.json';

// Use romaji field directly
const character = hiraganaData.characters[0];
console.log(character.romaji); // ["a"]
```

### Example 2: Adapter for "romanji" Applications

If your application uses `romanji` internally:

```typescript
// Create an adapter module
export function importKanaData(publicData: typeof hiraganaData) {
  return {
    ...publicData,
    characters: publicData.characters.map(char => ({
      character: char.character,
      romanji: char.romaji, // Map romaji → romanji
      type: char.type
    }))
  };
}

// Usage in your app
import { importKanaData } from './adapters';
import hiraganaPublic from './datasets/kana/hiragana.json';

const hiraganaInternal = importKanaData(hiraganaPublic);
// Now uses: { character: "あ", romanji: ["a"], type: "basic" }
```

### Example 3: Export Adapter

When exporting data back to this repository:

```typescript
export function exportKanaData(internalData: InternalKanaData) {
  return {
    ...internalData,
    characters: internalData.characters.map(char => ({
      character: char.character,
      romaji: char.romanji, // Map romanji → romaji
      type: char.type
    }))
  };
}
```

## Vocabulary Field Mapping

Vocabulary datasets also use `romaji`:

```typescript
// Public dataset format
{
  "word": "お腹",
  "kana": "おなか",
  "romaji": ["onaka"], // ← Correct spelling
  "meaning": "stomach",
  "jlptLevel": "N5"
}

// Internal "romanji" application adapter
function importVocabulary(publicData: typeof vocabData) {
  return {
    ...publicData,
    words: publicData.words.map(word => ({
      ...word,
      romanji: word.romaji, // Map romaji → romanji
      romaji: undefined     // Remove romaji field
    }))
  };
}
```

## TypeScript Interface Examples

### Public Dataset Interface

```typescript
// For this repository
export interface KanaCharacter {
  character: string;
  romaji: string[];  // ← Correct spelling
  type: 'basic' | 'dakuten' | 'combo';
}

export interface VocabularyWord {
  word: string;
  kana: string;
  romaji: string[];  // ← Correct spelling
  meaning: string;
  jlptLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
}
```

### Internal Application Interface

```typescript
// For apps using "romanji" internally
export interface InternalKanaCharacter {
  character: string;
  romanji: string[];  // Internal usage
  type: 'basic' | 'dakuten' | 'combo';
}
```

## User Interface Text

Always use **"romaji"** (correct spelling) in user-facing text:

```typescript
// ✅ Correct
<input placeholder="Type romaji here..." />
<label>What is the romaji?</label>

// ❌ Incorrect
<input placeholder="Type romanji here..." />
<label>What is the romanji?</label>
```

## Database Schema

### SQLite Example (Codex Mobile)

```sql
-- Internal storage can use "romanji" for backward compatibility
CREATE TABLE kana (
  id INTEGER PRIMARY KEY,
  character TEXT NOT NULL,
  romanji TEXT NOT NULL,  -- Internal field
  type TEXT NOT NULL
);

-- Export view uses correct spelling
CREATE VIEW kana_export AS
SELECT
  character,
  romanji AS romaji,  -- Map to correct spelling for export
  type
FROM kana;
```

## Summary

| Scenario | Field Name | Rationale |
|----------|-----------|-----------|
| Public datasets in this repo | `romaji` | Correct English spelling |
| Internal application code | `romanji` or `romaji` | Backward compatibility or correctness |
| User-facing UI text | "romaji" | Correct spelling for users |
| Data export to this repo | `romaji` | Must match public format |
| Data import from this repo | Adapter maps `romaji → romanji` | Maintains internal consistency |

---

**Last Updated**: 2026-01-11
**Recommendation**: Use "romaji" for all new code. Only use adapters if maintaining backward compatibility with existing "romanji" codebases.
