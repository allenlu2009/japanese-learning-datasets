# Schema v1.0 Quick Reference

**TL;DR**: Flat structure with version `"1.0"`, separate `tests` and `attempts` arrays linked by ID.

---

## Minimal Valid Export

Empty export (no test data, but valid schema):

```json
{
  "version": "1.0",
  "exportedAt": "2026-01-15T10:00:00.000Z",
  "tests": [],
  "attempts": [],
  "settings": {},
  "meta": {
    "exportedBy": "claude",
    "platform": "web"
  }
}
```

**Note**: Empty arrays `[]` and empty settings object `{}` are valid. Only `meta.exportedBy` and `meta.platform` are required within meta.

---

## Single Test Example

```json
{
  "version": "1.0",
  "exportedAt": "2026-01-15T10:00:00.000Z",
  "tests": [
    {
      "id": "test-1",
      "timestamp": "2026-01-15T09:00:00.000Z",
      "testType": "hiragana",
      "score": 80,
      "totalQuestions": 5,
      "correctAnswers": 4
    }
  ],
  "attempts": [
    {
      "id": "attempt-1",
      "testId": "test-1",
      "timestamp": "2026-01-15T09:00:01.000Z",
      "prompt": "あ",
      "expected": ["a"],
      "response": "a",
      "correct": true
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

## Field Checklist

### Top Level (All Required)
- [ ] `version` = `"1.0"` (string, exact match)
- [ ] `exportedAt` (ISO 8601 string)
- [ ] `tests` (array, can be empty `[]`)
- [ ] `attempts` (array, can be empty `[]`)
- [ ] `settings` (object, can be empty `{}`)
- [ ] `meta` (object with required fields)

### Each Test Record
- [ ] `id` (string, unique)
- [ ] `timestamp` (ISO 8601 string)
- [ ] `testType` (hiragana | katakana | kanji | vocabulary | mixed)
- [ ] `score` (number, 0-100)
- [ ] `totalQuestions` (number)
- [ ] `correctAnswers` (number)

### Each Attempt Record
- [ ] `id` (string, unique)
- [ ] `testId` (string, must match a test.id)
- [ ] `timestamp` (ISO 8601 string)
- [ ] `prompt` (string)
- [ ] `expected` (array of strings)
- [ ] `response` (string)
- [ ] `correct` (boolean)

### Meta Object
- [ ] `exportedBy` (claude | gemini | codex)
- [ ] `platform` (web | mobile)

---

## Common Mistakes

❌ **Wrong version**
```json
{ "version": "1.0.0" }  // WRONG
```
✅ **Correct**
```json
{ "version": "1.0" }    // CORRECT
```

---

❌ **Nested structure**
```json
{
  "tests": [{
    "breakdown": [...]  // WRONG - nested
  }]
}
```
✅ **Flat structure**
```json
{
  "tests": [...],
  "attempts": [...]     // CORRECT - separate arrays
}
```

---

❌ **Wrong field name**
```json
{
  "tests": [{
    "scorePercentage": 80  // WRONG
  }]
}
```
✅ **Correct field name**
```json
{
  "tests": [{
    "score": 80           // CORRECT
  }]
}
```

---

❌ **Missing test ID**
```json
{
  "tests": [{
    "timestamp": "...",   // Missing id field
    "testType": "hiragana"
  }]
}
```
✅ **Include test ID**
```json
{
  "tests": [{
    "id": "test-123",     // CORRECT
    "timestamp": "...",
    "testType": "hiragana"
  }]
}
```

---

❌ **Epoch timestamp**
```json
{ "timestamp": 1736956876 }  // WRONG - number
```
✅ **ISO 8601 string**
```json
{ "timestamp": "2026-01-15T10:00:00.000Z" }  // CORRECT
```

---

## Validation One-Liner

```bash
node -e "
const data = require('./export.json');
const valid =
  data.version === '1.0' &&
  Array.isArray(data.tests) &&
  Array.isArray(data.attempts) &&
  typeof data.settings === 'object' &&
  typeof data.meta === 'object' &&
  data.meta.exportedBy &&
  data.meta.platform;
console.log(valid ? '✅ Valid' : '❌ Invalid');
"
```

---

## Test Type Mapping

| Internal (Codex) | Canonical v1.0 |
|------------------|----------------|
| `jlpt-kanji`     | `kanji`        |
| `jlpt-vocab`     | `vocabulary`   |
| `hiragana`       | `hiragana`     |
| `katakana`       | `katakana`     |

---

## ID Requirements

- **Test IDs**: Must be unique across all tests
- **Attempt IDs**: Must be unique across all attempts
- **testId links**: Every `attempt.testId` must reference a valid `test.id`

**Recommended**: Use UUIDs
```javascript
import { v4 as uuidv4 } from 'uuid';
const testId = uuidv4();  // "e20864fa-831c-4513-b38f-5f0c766d02ae"
```

---

## Timestamp Format

**In Export Files**: MUST be ISO 8601 strings

**Valid ISO 8601 formats:**
```
2026-01-15T15:41:16.332Z     ✅ With milliseconds
2026-01-15T15:41:16Z         ✅ Without milliseconds
2026-01-15T15:41:16+00:00    ✅ With timezone
```

**Internal Storage**: Apps can use epoch integers internally (e.g., SQLite), but MUST convert to ISO 8601 for export.

**Convert to ISO 8601 for export:**
```javascript
// From Date object
new Date().toISOString()

// From epoch (milliseconds)
new Date(1736956876332).toISOString()

// From date string
new Date('2026-01-15 10:00:00').toISOString()
```

**Convert from ISO 8601 on import:**
```javascript
// To epoch (milliseconds)
new Date(isoString).getTime()

// To Date object
new Date(isoString)
```

**Important**: Only validate export file format. Don't validate internal storage - adapters handle conversion.

---

## See Also

- Full Documentation: `SCHEMA_V1.md`
- TypeScript Types: `schema/export-schema.ts`
- Adapters: `schema/examples/`
- Validation Script: `scripts/validate-v1.js`

---

**Version**: 1.0
**Last Updated**: 2026-01-15
