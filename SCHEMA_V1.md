# Universal Export Schema v1.0

**Status**: ✅ FINALIZED
**Date**: 2026-01-15
**Confirmed by**: Claude, Gemini, Codex

---

## Overview

This document describes the **Universal Export Schema v1.0** for cross-platform data portability between Japanese learning applications. This schema enables users to export their test history from one implementation (Claude Web, Gemini Mobile, Codex Mobile/Web) and import it into another.

## Key Principles

1. **Flat Structure**: Tests and attempts are separate arrays, linked by ID references
2. **Version String**: Must be exactly `"1.0"` (not `"1.0.0"`)
3. **Required Fields**: All top-level fields are mandatory
4. **ID-based Linking**: Attempts reference tests via `testId` foreign key
5. **ISO 8601 Timestamps**: All timestamps must be ISO 8601 formatted strings

---

## Schema Definition

### Top-Level Structure

```typescript
interface UniversalExport {
  version: "1.0";                    // MUST be exactly "1.0"
  exportedAt: string;                 // ISO 8601 timestamp
  tests: TestRecord[];                // Array of test sessions
  attempts: CharacterAttemptRecord[]; // Array of character attempts
  settings: SettingsObject;           // User settings
  meta: MetaObject;                   // Export metadata
}
```

### TestRecord

Represents a single test session (e.g., a hiragana quiz with 15 questions).

```typescript
interface TestRecord {
  id: string;              // Unique test identifier (UUID recommended)
  timestamp: string;       // ISO 8601 timestamp when test was completed
  testType: TestType;      // Canonical test type
  score: number;           // Score as percentage (0-100)
  totalQuestions: number;  // Total number of questions in test
  correctAnswers: number;  // Number of correct answers
  jlptLevel?: string;      // Optional: "N5", "N4", "N3", "N2", "N1"
  difficulty?: string;     // Optional: test difficulty/mode (e.g., "1-char", "3-char")
}
```

**TestType** (Canonical):
```typescript
type TestType = 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'mixed';
```

**Internal Mapping**:
| Internal Type (Codex) | Canonical Type |
|----------------------|----------------|
| `jlpt-kanji`         | `kanji`        |
| `jlpt-vocab`         | `vocabulary`   |
| `hiragana`           | `hiragana`     |
| `katakana`           | `katakana`     |

### CharacterAttemptRecord

Represents a single character/word attempt within a test session.

```typescript
interface CharacterAttemptRecord {
  id: string;                 // Unique attempt identifier
  testId: string;             // Foreign key → TestRecord.id
  timestamp: string;          // ISO 8601 timestamp
  prompt: string;             // Character/word shown to user (e.g., "あ", "日本")
  expected: string[];         // Array of acceptable answers (e.g., ["a"], ["zu", "du"])
  response: string;           // User's actual response
  correct: boolean;           // Whether answer was correct
  scriptType?: string;        // Optional: "hiragana", "katakana", "kanji", "vocabulary"
  jlptLevel?: string;         // Optional: "N5", "N4", etc.
  characterType?: string;     // Optional: "basic", "dakuten", "combo"
}
```

### Settings Object

User preferences and application settings.

```typescript
interface SettingsObject {
  romajiSystem?: 'hepburn' | 'kunrei' | 'nihon';
  audioSettings?: {
    enabled: boolean;
    rate?: number;
    volume?: number;
  };
  [key: string]: unknown;  // Extensible for app-specific settings
}
```

### Meta Object

Metadata about the export.

```typescript
interface MetaObject {
  exportedBy: 'claude' | 'gemini' | 'codex';
  platform: 'web' | 'mobile';
  [key: string]: unknown;  // Extensible for additional metadata
}
```

---

## Complete Example

```json
{
  "version": "1.0",
  "exportedAt": "2026-01-15T15:41:16.332Z",
  "tests": [
    {
      "id": "test-abc-123",
      "timestamp": "2026-01-15T10:00:00.000Z",
      "testType": "hiragana",
      "score": 67,
      "totalQuestions": 3,
      "correctAnswers": 2,
      "difficulty": "1-char"
    }
  ],
  "attempts": [
    {
      "id": "attempt-1",
      "testId": "test-abc-123",
      "timestamp": "2026-01-15T10:00:01.000Z",
      "prompt": "あ",
      "expected": ["a"],
      "response": "a",
      "correct": true,
      "scriptType": "hiragana",
      "characterType": "basic"
    },
    {
      "id": "attempt-2",
      "testId": "test-abc-123",
      "timestamp": "2026-01-15T10:00:02.000Z",
      "prompt": "ず",
      "expected": ["zu", "du"],
      "response": "zu",
      "correct": true,
      "scriptType": "hiragana",
      "characterType": "dakuten"
    },
    {
      "id": "attempt-3",
      "testId": "test-abc-123",
      "timestamp": "2026-01-15T10:00:03.000Z",
      "prompt": "う",
      "expected": ["u"],
      "response": "o",
      "correct": false,
      "scriptType": "hiragana",
      "characterType": "basic"
    }
  ],
  "settings": {
    "romajiSystem": "hepburn"
  },
  "meta": {
    "exportedBy": "claude",
    "platform": "web"
  }
}
```

---

## Validation Rules

### Required Fields

**Top Level (all required):**
- `version` (must be `"1.0"`)
- `exportedAt` (ISO 8601 string)
- `tests` (array, can be empty)
- `attempts` (array, can be empty)
- `settings` (object)
- `meta` (object)

**TestRecord (all required):**
- `id` (string)
- `timestamp` (ISO 8601 string)
- `testType` (one of: hiragana, katakana, kanji, vocabulary, mixed)
- `score` (number, 0-100)
- `totalQuestions` (number)
- `correctAnswers` (number)

**CharacterAttemptRecord (required):**
- `id` (string)
- `testId` (string, must reference valid test ID)
- `timestamp` (ISO 8601 string)
- `prompt` (string)
- `expected` (array of strings)
- `response` (string)
- `correct` (boolean)

**MetaObject (required):**
- `exportedBy` (one of: claude, gemini, codex)
- `platform` (one of: web, mobile)

### Referential Integrity

- Every `attempt.testId` MUST reference a valid `test.id`
- All IDs should be unique within their respective arrays

### Timestamp Format

All timestamps must be valid ISO 8601 strings:
```
2026-01-15T15:41:16.332Z  ✅ Valid
2026-01-15T15:41:16Z      ✅ Valid
2026-01-15 15:41:16       ❌ Invalid (not ISO 8601)
1736956876332             ❌ Invalid (epoch integer, not string)
```

### Score Validation

- `score` must be a number between 0 and 100
- `score` should equal `Math.round((correctAnswers / totalQuestions) * 100)`
- **Note**: Field is named `score`, NOT `scorePercentage`

---

## Implementation Guidelines

### Export Process

1. **Group Data by Test Session**: Collect all character attempts for each test
2. **Generate IDs**: Ensure all tests and attempts have unique IDs
3. **Convert Timestamps**: Convert internal timestamps to ISO 8601 strings
4. **Map Test Types**: Convert internal test types to canonical format
5. **Flatten Structure**: Create separate `tests` and `attempts` arrays
6. **Add Metadata**: Include version, exportedAt, settings, and meta

### Import Process

1. **Validate Schema**: Check version, required fields, and structure
2. **Validate Referential Integrity**: Ensure all testIds reference valid tests
3. **Check for Duplicates**: Use test IDs to detect duplicate imports
4. **Convert Timestamps**: Convert ISO 8601 to internal format if needed
5. **Map Test Types**: Convert canonical types to internal format
6. **Reconstruct Relationships**: Link attempts back to tests by testId
7. **Merge Data**: Add new tests/attempts to existing data

### Duplicate Handling

**Primary Strategy**: ID-based deduplication
- If importing a test with an ID that already exists, skip it
- Show user: "X duplicates skipped"

**Secondary Warning**: Timestamp + TestType matching
- Warn if different IDs but same timestamp and testType
- Could indicate data corruption or multiple sources

---

## Conversion from Old Format

If you have an old nested format (v1.0.0), use the conversion utility:

```typescript
import { convertFromNestedFormat } from './export-schema-v1.ts';

const oldFormat = {
  version: "1.0.0",
  tests: [{
    testType: "hiragana",
    scorePercentage: 67,  // Old field name
    breakdown: [...]       // Nested structure
  }]
};

const newFormat = convertFromNestedFormat(oldFormat);
// newFormat is now valid v1.0 with flat structure
```

---

## Differences from v1.0.0 (Old Format)

| Aspect | v1.0.0 (Old) | v1.0 (Current) |
|--------|--------------|----------------|
| **Version** | `"1.0.0"` | `"1.0"` |
| **Structure** | Nested (`breakdown` inside tests) | Flat (separate arrays) |
| **Test ID** | ❌ Missing | ✅ Required |
| **Score Field** | `scorePercentage` | `score` |
| **Attempts** | Nested as `breakdown` | Top-level `attempts` array |
| **Settings** | ❌ Missing | ✅ Required |
| **Meta** | `source` + `platform` at top level | Grouped in `meta` object |

---

## Testing & Validation

### Validation Script

Location: `/tmp/japanese-learning-datasets/scripts/validate-v1.js`

```bash
node scripts/validate-v1.js path/to/export.json
```

### Test Files

Sample exports for testing:
- `tests/sample-hiragana-v1.json` - Simple hiragana test
- `tests/sample-mixed-v1.json` - Multiple test types
- `tests/sample-with-jlpt-v1.json` - Kanji/vocab with JLPT levels

---

## Implementation Status

| Implementation | Export v1.0 | Import v1.0 | Status |
|----------------|-------------|-------------|--------|
| Claude Web     | ✅          | ✅          | Complete |
| Claude Mobile  | ⏳          | ⏳          | Pending |
| Gemini Web     | ✅          | ⏳          | Export Done |
| Gemini Mobile  | ✅          | ⏳          | Export Done |
| Codex Web      | ⏳          | ⏳          | Pending |
| Codex Mobile   | ⏳          | ⏳          | Pending |

---

## Version History

### v1.0 (2026-01-15)
- ✅ **FINALIZED and confirmed by all parties**
- Flat structure with top-level attempts array
- Test records include required `id` field
- `score` field (not `scorePercentage`)
- Required `settings` and `meta` objects
- Version string must be exactly `"1.0"`

### v1.0.0 (2026-01-12 - deprecated)
- Initial implementation by Claude
- Nested structure with `breakdown` inside tests
- Missing test IDs, settings, and meta structure
- **Do not use** - migrate to v1.0

---

## Support & Issues

- **Schema Repository**: https://github.com/allenlu2009/japanese-learning-datasets
- **Issues**: Create issue with tag `schema-v1`
- **Questions**: Contact implementation leads (Claude, Gemini, Codex)

---

## References

- TypeScript Schema: `schema/export-schema.ts`
- Conversion Utilities: `schema/export-schema-v1.ts`
- Adapter Examples:
  - `schema/examples/claude-adapter.ts`
  - `schema/examples/gemini-adapter.ts`
  - `schema/examples/codex-adapter.ts`

---

**Last Updated**: 2026-01-15
**Maintained by**: Claude, Gemini, Codex collaboration
**Schema Version**: 1.0 (stable)
