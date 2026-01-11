/**
 * Example adapter for Codex mobile application
 * Shows how to convert between SQLite storage and universal export format
 */

import {
  UniversalExport,
  TestRecord,
  TestType,
  TimestampUtils,
  BreakdownUtils,
  createExport,
  TEST_TYPE_MAPPING
} from '../export-schema';

// Codex's internal SQLite schema
interface CodexAttemptRow {
  id: number;
  test_type: 'jlpt-kanji' | 'jlpt-vocab' | 'hiragana' | 'katakana';
  timestamp: number; // Epoch integer
  prompt: string;
  response: string;
  expected: string;
  is_correct: number; // SQLite boolean (0 or 1)
  subprompts: string | null; // JSON array
  subresponses: string | null; // JSON array
  subexpected: string | null; // JSON array
}

/**
 * Convert Codex's internal test type to canonical format
 */
function toCanonicalTestType(codexType: CodexAttemptRow['test_type']): TestType {
  return TEST_TYPE_MAPPING[codexType] as TestType;
}

/**
 * Convert canonical test type to Codex's internal format
 */
function toCodexTestType(canonicalType: TestType): CodexAttemptRow['test_type'] {
  const mapping: Record<TestType, CodexAttemptRow['test_type']> = {
    'kanji': 'jlpt-kanji',
    'vocabulary': 'jlpt-vocab',
    'hiragana': 'hiragana',
    'katakana': 'katakana',
    'mixed': 'hiragana' // Fallback
  };
  return mapping[canonicalType];
}

/**
 * Export Codex's SQLite data to universal format
 */
export function exportCodexData(attempts: CodexAttemptRow[]): UniversalExport {
  // Group attempts by timestamp to create test sessions
  const sessionMap = new Map<number, CodexAttemptRow[]>();

  attempts.forEach(attempt => {
    if (!sessionMap.has(attempt.timestamp)) {
      sessionMap.set(attempt.timestamp, []);
    }
    sessionMap.get(attempt.timestamp)!.push(attempt);
  });

  const tests: TestRecord[] = Array.from(sessionMap.entries()).map(([timestamp, sessionAttempts]) => {
    const correctCount = sessionAttempts.filter(a => a.is_correct === 1).length;
    const firstAttempt = sessionAttempts[0];

    // Create breakdown if subprompts exist
    let breakdown = undefined;
    if (firstAttempt.subprompts && firstAttempt.subresponses && firstAttempt.subexpected) {
      const subprompts = JSON.parse(firstAttempt.subprompts) as string[];
      const subresponses = JSON.parse(firstAttempt.subresponses) as string[];
      const subexpected = JSON.parse(firstAttempt.subexpected) as string[];

      breakdown = BreakdownUtils.fromCodex(subprompts, subresponses, subexpected);
    }

    return {
      testType: toCanonicalTestType(firstAttempt.test_type),
      timestamp: TimestampUtils.toISO(timestamp),
      totalQuestions: sessionAttempts.length,
      correctAnswers: correctCount,
      scorePercentage: Math.round((correctCount / sessionAttempts.length) * 100),
      breakdown
    };
  });

  return createExport(tests, 'codex', 'mobile');
}

/**
 * Import universal format into Codex's SQLite format
 */
export function importToCodexFormat(data: UniversalExport): CodexAttemptRow[] {
  const rows: CodexAttemptRow[] = [];
  let id = 1;

  data.tests.forEach(test => {
    const timestamp = TimestampUtils.toEpoch(test.timestamp);
    const testType = toCodexTestType(test.testType);

    if (test.breakdown) {
      // Has character breakdown - create detailed records
      const codexFormat = BreakdownUtils.toCodex(test.breakdown);

      test.breakdown.forEach((char, index) => {
        rows.push({
          id: id++,
          test_type: testType,
          timestamp,
          prompt: char.character,
          response: char.response,
          expected: char.expected[0],
          is_correct: char.correct ? 1 : 0,
          subprompts: JSON.stringify(codexFormat.subprompts),
          subresponses: JSON.stringify(codexFormat.subresponses),
          subexpected: JSON.stringify(codexFormat.expected)
        });
      });
    } else {
      // No breakdown - create summary record
      rows.push({
        id: id++,
        test_type: testType,
        timestamp,
        prompt: `${test.testType} test`,
        response: `${test.correctAnswers}/${test.totalQuestions}`,
        expected: `${test.scorePercentage}%`,
        is_correct: test.scorePercentage >= 70 ? 1 : 0,
        subprompts: null,
        subresponses: null,
        subexpected: null
      });
    }
  });

  return rows;
}

/**
 * SQL query to export all attempts
 */
export const EXPORT_QUERY = `
  SELECT
    id,
    test_type,
    timestamp,
    prompt,
    response,
    expected,
    is_correct,
    subprompts,
    subresponses,
    subexpected
  FROM attempts
  ORDER BY timestamp DESC
`;

/**
 * SQL to import a single test record
 */
export function generateInsertSQL(row: CodexAttemptRow): string {
  return `
    INSERT INTO attempts (
      test_type, timestamp, prompt, response, expected, is_correct,
      subprompts, subresponses, subexpected
    ) VALUES (
      '${row.test_type}',
      ${row.timestamp},
      '${row.prompt.replace(/'/g, "''")}',
      '${row.response.replace(/'/g, "''")}',
      '${row.expected.replace(/'/g, "''")}',
      ${row.is_correct},
      ${row.subprompts ? `'${row.subprompts.replace(/'/g, "''")}'` : 'NULL'},
      ${row.subresponses ? `'${row.subresponses.replace(/'/g, "''")}'` : 'NULL'},
      ${row.subexpected ? `'${row.subexpected.replace(/'/g, "''")}'` : 'NULL'}
    )
  `;
}
