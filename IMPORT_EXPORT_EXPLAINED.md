# Import/Export Questions Answered

## Question 1: Why did Web work but Mobile had problems?

### Web (No issues)
**Storage:** Browser `localStorage` (JSON text storage)
```
localStorage.setItem('characterAttempts', JSON.stringify(attempts))
```

**Characteristics:**
- ✅ No schema constraints
- ✅ No column types
- ✅ No NOT NULL requirements
- ✅ Can store any valid JSON structure
- ✅ Field names can change freely

**Export/Import:**
```typescript
// Export: Direct serialization
const data = JSON.parse(localStorage.getItem('characterAttempts'))
return JSON.stringify(transformToV1(data))

// Import: Direct deserialization
const v1Data = JSON.parse(jsonString)
const internal = transformFromV1(v1Data)
localStorage.setItem('characterAttempts', JSON.stringify(internal))
```

**Why no problems:** localStorage is just text storage. As long as the JavaScript code can parse the JSON, it works. No database schema to match.

---

### Mobile (Had many issues)
**Storage:** SQLite database with strict schema

```sql
CREATE TABLE tests (
  id TEXT PRIMARY KEY,
  date INTEGER NOT NULL,           -- ❌ MUST be present, MUST be integer
  score INTEGER NOT NULL,           -- ❌ MUST be present
  category TEXT NOT NULL,           -- ❌ MUST be present
  description TEXT NOT NULL,        -- ❌ MUST be present
  test_type TEXT NOT NULL,          -- ❌ MUST be present
  num_questions INTEGER NOT NULL,   -- ❌ MUST be present
  -- ...
);
```

**Characteristics:**
- ❌ Strict schema constraints
- ❌ Column types enforced (TEXT, INTEGER, etc.)
- ❌ NOT NULL constraints enforced
- ❌ Cannot INSERT data with missing columns
- ❌ Cannot INSERT data with wrong column names

**Export/Import:**
```typescript
// Export: Query database → Transform
const tests = await db.getAllAsync('SELECT * FROM tests')
return transformToV1(tests)

// Import: Transform → INSERT into database
const v1Data = JSON.parse(jsonString)
const normalized = transformFromV1(v1Data)
await db.runAsync(
  'INSERT INTO tests (id, date, score, category, ...) VALUES (?, ?, ?, ?, ...)',
  [normalized.id, normalized.date, normalized.score, normalized.category, ...]
)
```

**Why problems happened:**

1. **Old database had different column names**
   - Old: `timestamp`, `total_questions`, `prompt`, `expected`, `response`, `correct`
   - New: `date`, `num_questions`, `character`, `correct_answers`, `user_answer`, `is_correct`
   - Solution: Migration to rename columns (requires table rebuild in SQLite)

2. **v1.0 format missing required fields**
   - v1.0 has: `timestamp`, `testType`, `score`, `totalQuestions`
   - Database needs: `date`, `category`, `description`, `num_questions`, `created_at`, `updated_at`
   - Solution: Generate defaults during import (`category: 'read'`, `description: 'hiragana - 67%'`)

3. **NOT NULL constraints**
   - Can't INSERT with NULL values
   - Can't ALTER TABLE ADD COLUMN without DEFAULT value
   - Solution: Provide default values in migration and import logic

4. **Schema migration complexity**
   - SQLite doesn't support column rename directly
   - Must: CREATE new table → COPY data → DROP old → RENAME new
   - Must handle all column name variations during copy

---

## Question 2: Two Export/Imports in Web - Legacy?

### Current Status

**1. Analytics Page (`/analytics`)**
- ✅ **HAS Export/Import buttons**
- Location: `app/analytics/page.tsx`
- Scope: **All test history** (Hiragana, Katakana, Kanji, Vocabulary)
- Uses: `downloadUniversalExport()` and `importFromUniversalFormat()`
- Format: Universal v1.0 schema
- Purpose: **Main backup/restore for cross-platform use**

**2. Kanji/Vocab Analytics Page (`/kanji-vocab-analytics`)**
- ❌ **NO Export/Import buttons**
- Location: `app/kanji-vocab-analytics/page.tsx`
- Scope: Kanji and Vocabulary analytics only
- Uses: Only displays statistics (no export/import)
- Purpose: **Read-only analytics view**

### Answer: NOT Legacy

There's only **ONE export/import** in the web version, located in the main Analytics page.

**Why you might have thought there were two:**
- There are two analytics pages (`/analytics` and `/kanji-vocab-analytics`)
- Both show character statistics and charts
- But only `/analytics` has export/import functionality

**Design rationale:**
- `/analytics` is the main hub for Hiragana/Katakana with export/import
- `/kanji-vocab-analytics` is a specialized view for JLPT learners (read-only)
- Having export/import in both would be redundant since they export the same underlying data

---

## Comparison Summary

| Aspect | Web | Mobile | Universal v1.0 |
|--------|-----|--------|----------------|
| **Storage** | localStorage (JSON) | SQLite (relational DB) | JSON interchange format |
| **Schema** | Flexible | Strict with constraints | Defined spec |
| **Migration** | Not needed | Required for old DBs | N/A |
| **Constraints** | None | NOT NULL, types, FK | Schema validation |
| **Field Names** | Internal (character, userAnswer) | Database (character, user_answer) | v1.0 (prompt, response) |
| **Issues** | None | Column mismatches, NULL values | Format compatibility |

---

## Debug Script Usage

```bash
# Validate an export file
node scripts/debug-import-export.js validate ~/gdrive/Work/japanese-tests-1768574678612.json

# Compare web vs mobile schemas
node scripts/debug-import-export.js compare
```

**Output includes:**
- ✅ v1.0 format validation
- 📋 Mobile database schema mapping (v1.0 → SQLite)
- 📊 Test statistics (type distribution, scores, date range)
- 🔍 Detailed field mapping for each record type

---

## Key Takeaways

1. **Web is simple** because localStorage has no schema constraints
2. **Mobile is complex** because SQLite enforces schema, types, and constraints
3. **Migration needed** when database schema changes (column names, new columns)
4. **v1.0 format** is the bridge between implementations
5. **Only one export/import** in web version, located in main analytics page
6. **Debug script** helps troubleshoot export/import issues
