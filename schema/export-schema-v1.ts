/**
 * Universal Export Schema v1.0 for Japanese Learning Apps
 *
 * FINALIZED SPEC - All implementations must use this format
 *
 * Version: 1.0
 * Last Updated: 2026-01-12
 */

// ============================================================================
// Test Types
// ============================================================================

export type TestType = 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'mixed';

export const TEST_TYPE_MAPPING = {
  // Codex internal → canonical
  'jlpt-kanji': 'kanji' as TestType,
  'jlpt-vocab': 'vocabulary' as TestType,
  'hiragana': 'hiragana' as TestType,
  'katakana': 'katakana' as TestType,

  // Canonical → Codex internal
  'kanji': 'jlpt-kanji',
  'vocabulary': 'jlpt-vocab',
} as const;

// ============================================================================
// Timestamp Utilities
// ============================================================================

export const TimestampUtils = {
  toISO(timestamp: number | string | Date): string {
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toISOString();
    }
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toISOString();
    }
    return timestamp.toISOString();
  },

  toEpoch(isoString: string): number {
    return new Date(isoString).getTime();
  },

  now(): string {
    return new Date().toISOString();
  }
};

// ============================================================================
// Test Record (Flat Structure)
// ============================================================================

/**
 * A single test session record
 * NOTE: Individual character attempts are stored separately in the attempts array
 */
export interface TestRecord {
  /** Unique test ID */
  id: string;

  /** ISO 8601 timestamp when test was completed */
  timestamp: string;

  /** Canonical test type */
  testType: TestType;

  /** Score as percentage (0-100) */
  score: number;

  /** Total number of questions in the test */
  totalQuestions: number;

  /** Number of correct answers */
  correctAnswers: number;

  /** JLPT level if applicable */
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

  /** Test difficulty or mode */
  difficulty?: string;
}

// ============================================================================
// Character Attempt Record (Flat Structure)
// ============================================================================

/**
 * Individual character attempt (linked to test by testId)
 * This is the flat structure - all attempts are at top level
 */
export interface CharacterAttemptRecord {
  /** Unique attempt ID */
  id: string;

  /** Foreign key to TestRecord.id */
  testId: string;

  /** ISO 8601 timestamp */
  timestamp: string;

  /** Character/word shown to user */
  prompt: string;

  /** Array of acceptable answers */
  expected: string[];

  /** User's actual response */
  response: string;

  /** Whether answer was correct */
  correct: boolean;

  /** Script type */
  scriptType?: 'hiragana' | 'katakana' | 'kanji' | 'vocabulary';

  /** JLPT level if applicable */
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

  /** Character type */
  characterType?: 'basic' | 'dakuten' | 'combo';
}

// ============================================================================
// Universal Export Format v1.0 (FINAL)
// ============================================================================

/**
 * Top-level export structure - FLAT SCHEMA
 * Tests and attempts are separate arrays, linked by ID
 */
export interface UniversalExport {
  /** Schema version - MUST be "1.0" */
  version: "1.0";

  /** ISO 8601 timestamp when export was created */
  exportedAt: string;

  /** Array of test session records */
  tests: TestRecord[];

  /** Array of individual character attempts (linked to tests by testId) */
  attempts: CharacterAttemptRecord[];

  /** App settings and preferences */
  settings: {
    romajiSystem?: 'hepburn' | 'kunrei' | 'nihon';
    audioSettings?: {
      enabled: boolean;
      rate?: number;
      volume?: number;
    };
    [key: string]: unknown;
  };

  /** Metadata about the export */
  meta: {
    exportedBy: 'claude' | 'gemini' | 'codex';
    platform: 'web' | 'mobile';
    [key: string]: unknown;
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a valid v1.0 export
 */
export function createExport(
  tests: TestRecord[],
  attempts: CharacterAttemptRecord[],
  exportedBy: 'claude' | 'gemini' | 'codex',
  platform: 'web' | 'mobile',
  settings: UniversalExport['settings'] = {}
): UniversalExport {
  return {
    version: "1.0",
    exportedAt: TimestampUtils.now(),
    tests,
    attempts,
    settings,
    meta: {
      exportedBy,
      platform
    }
  };
}

/**
 * Validate import data
 */
export function validateImport(data: unknown): data is UniversalExport {
  if (typeof data !== 'object' || data === null) return false;

  const obj = data as Record<string, unknown>;

  return (
    obj.version === '1.0' &&
    typeof obj.exportedAt === 'string' &&
    Array.isArray(obj.tests) &&
    Array.isArray(obj.attempts) &&
    typeof obj.settings === 'object' &&
    typeof obj.meta === 'object'
  );
}

// ============================================================================
// Conversion Utilities
// ============================================================================

/**
 * Convert from old nested format (v1.0.0) to new flat format (v1.0)
 */
export function convertFromNestedFormat(oldFormat: {
  version: string;
  exportedAt: string;
  source: string;
  platform: string;
  tests: Array<{
    testType: TestType;
    timestamp: string;
    totalQuestions: number;
    correctAnswers: number;
    scorePercentage: number;
    jlptLevel?: string;
    breakdown?: Array<{
      position: number;
      character: string;
      expected: string[];
      response: string;
      correct: boolean;
    }>;
  }>;
}): UniversalExport {
  const tests: TestRecord[] = [];
  const attempts: CharacterAttemptRecord[] = [];

  oldFormat.tests.forEach((oldTest, index) => {
    const testId = `test-${Date.now()}-${index}`;

    // Create test record
    tests.push({
      id: testId,
      timestamp: oldTest.timestamp,
      testType: oldTest.testType,
      score: oldTest.scorePercentage,
      totalQuestions: oldTest.totalQuestions,
      correctAnswers: oldTest.correctAnswers,
      jlptLevel: oldTest.jlptLevel as any
    });

    // Extract attempts from breakdown
    if (oldTest.breakdown) {
      oldTest.breakdown.forEach((item, attemptIndex) => {
        attempts.push({
          id: `${testId}-attempt-${attemptIndex}`,
          testId,
          timestamp: oldTest.timestamp,
          prompt: item.character,
          expected: item.expected,
          response: item.response,
          correct: item.correct,
          scriptType: oldTest.testType as any
        });
      });
    }
  });

  return {
    version: "1.0",
    exportedAt: oldFormat.exportedAt,
    tests,
    attempts,
    settings: {},
    meta: {
      exportedBy: oldFormat.source as any,
      platform: oldFormat.platform as any
    }
  };
}
