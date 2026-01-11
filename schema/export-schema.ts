/**
 * Universal Export Schema for Japanese Learning Apps
 *
 * This schema defines the canonical format for exporting and importing
 * user test data between Claude, Gemini, and Codex implementations.
 *
 * Version: 1.0.0
 * Last Updated: 2026-01-11
 */

// ============================================================================
// Test Types
// ============================================================================

/**
 * Canonical test type enumeration
 * All implementations must map their internal test types to these canonical values
 */
export type TestType = 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'mixed';

/**
 * Mapping table for internal test type conversions
 */
export const TEST_TYPE_MAPPING = {
  // Codex internal → canonical
  'jlpt-kanji': 'kanji' as TestType,
  'jlpt-vocab': 'vocabulary' as TestType,
  'hiragana': 'hiragana' as TestType,
  'katakana': 'katakana' as TestType,

  // Canonical → Codex internal
  'kanji': 'jlpt-kanji',
  'vocabulary': 'jlpt-vocab',
  // hiragana and katakana map directly
} as const;

// ============================================================================
// Timestamp Utilities
// ============================================================================

/**
 * Timestamp conversion utilities
 * Export format: Always ISO 8601 strings
 * Internal storage: Each implementation uses their preferred format
 */
export const TimestampUtils = {
  /**
   * Convert to ISO 8601 string for export
   */
  toISO(timestamp: number | string | Date): string {
    if (typeof timestamp === 'string') {
      // Already ISO string, validate and return
      return new Date(timestamp).toISOString();
    }
    if (typeof timestamp === 'number') {
      // Epoch integer (milliseconds)
      return new Date(timestamp).toISOString();
    }
    return timestamp.toISOString();
  },

  /**
   * Convert from ISO 8601 string to epoch integer (for Codex SQLite)
   */
  toEpoch(isoString: string): number {
    return new Date(isoString).getTime();
  },

  /**
   * Current timestamp in ISO format
   */
  now(): string {
    return new Date().toISOString();
  }
};

// ============================================================================
// Character Attempt Breakdown
// ============================================================================

/**
 * Canonical format for character-by-character attempt breakdown
 * Used for multi-character tests (3-char kana, kanji, vocabulary)
 */
export interface CharacterAttempt {
  /** Position in the sequence (0-indexed) */
  position: number;

  /** The character shown to user */
  character: string;

  /** Array of acceptable answers for this character */
  expected: string[];

  /** User's actual response for this character */
  response: string;

  /** Whether this specific character was correct */
  correct: boolean;
}

/**
 * Breakdown conversion utilities
 */
export const BreakdownUtils = {
  /**
   * Convert from Claude's characterBreakdown format
   */
  fromClaude(claudeBreakdown: {
    character: string;
    userSyllable: string;
    correctSyllables: string[];
  }[], characters: string): CharacterAttempt[] {
    return claudeBreakdown.map((item, index) => ({
      position: index,
      character: item.character,
      expected: item.correctSyllables,
      response: item.userSyllable,
      correct: item.correctSyllables.includes(item.userSyllable.toLowerCase())
    }));
  },

  /**
   * Convert to Claude's characterBreakdown format
   */
  toClaude(canonical: CharacterAttempt[]): {
    character: string;
    userSyllable: string;
    correctSyllables: string[];
  }[] {
    return canonical.map(item => ({
      character: item.character,
      userSyllable: item.response,
      correctSyllables: item.expected
    }));
  },

  /**
   * Convert from Codex's subprompt/subresponse format
   */
  fromCodex(
    subprompts: string[],
    subresponses: string[],
    expected: string[]
  ): CharacterAttempt[] {
    return subprompts.map((char, index) => ({
      position: index,
      character: char,
      expected: [expected[index]],
      response: subresponses[index] || '',
      correct: subresponses[index]?.toLowerCase() === expected[index]?.toLowerCase()
    }));
  },

  /**
   * Convert to Codex's subprompt/subresponse format
   */
  toCodex(canonical: CharacterAttempt[]): {
    subprompts: string[];
    subresponses: string[];
    expected: string[];
  } {
    return {
      subprompts: canonical.map(item => item.character),
      subresponses: canonical.map(item => item.response),
      expected: canonical.map(item => item.expected[0]) // Take first acceptable answer
    };
  }
};

// ============================================================================
// Test Record
// ============================================================================

/**
 * A single test attempt record
 * This is the core data structure for user progress tracking
 */
export interface TestRecord {
  /** Canonical test type */
  testType: TestType;

  /** ISO 8601 timestamp when test was completed */
  timestamp: string;

  /** Total number of questions in the test */
  totalQuestions: number;

  /** Number of correct answers */
  correctAnswers: number;

  /** Score as percentage (0-100) */
  scorePercentage: number;

  /** JLPT level if applicable (N5, N4, N3, N2, N1) */
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

  /** Whether this was a practice or graded test */
  isPractice?: boolean;

  /**
   * Optional: Character-by-character breakdown for multi-character tests
   * Only populated for tests that show character analysis (3-char kana tests)
   */
  breakdown?: CharacterAttempt[];
}

// ============================================================================
// Universal Export Format
// ============================================================================

/**
 * Top-level export structure
 * This is what gets serialized to JSON for cross-app data portability
 */
export interface UniversalExport {
  /** Schema version for future compatibility */
  version: string;

  /** ISO 8601 timestamp when export was created */
  exportedAt: string;

  /** Source application (claude, gemini, codex) */
  source: 'claude' | 'gemini' | 'codex';

  /** Platform (web, mobile) */
  platform: 'web' | 'mobile';

  /** User's test history */
  tests: TestRecord[];

  /** Optional: User preferences or settings */
  preferences?: {
    /** Preferred romaji system if applicable */
    romajiSystem?: 'hepburn' | 'kunrei' | 'nihon';

    /** Audio playback settings */
    audioSettings?: {
      enabled: boolean;
      rate?: number;
      volume?: number;
    };

    /** Any other app-specific settings */
    [key: string]: unknown;
  };
}

// ============================================================================
// Example Usage
// ============================================================================

/**
 * Example: Creating an export
 */
export function createExport(
  tests: TestRecord[],
  source: 'claude' | 'gemini' | 'codex',
  platform: 'web' | 'mobile'
): UniversalExport {
  return {
    version: '1.0.0',
    exportedAt: TimestampUtils.now(),
    source,
    platform,
    tests,
    preferences: {}
  };
}

/**
 * Example: Validating an import
 */
export function validateImport(data: unknown): data is UniversalExport {
  if (typeof data !== 'object' || data === null) return false;

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.version === 'string' &&
    typeof obj.exportedAt === 'string' &&
    ['claude', 'gemini', 'codex'].includes(obj.source as string) &&
    ['web', 'mobile'].includes(obj.platform as string) &&
    Array.isArray(obj.tests)
  );
}

// ============================================================================
// Type Guards
// ============================================================================

export function isTestType(value: string): value is TestType {
  return ['hiragana', 'katakana', 'kanji', 'vocabulary', 'mixed'].includes(value);
}

export function isJLPTLevel(value: string): value is 'N5' | 'N4' | 'N3' | 'N2' | 'N1' {
  return ['N5', 'N4', 'N3', 'N2', 'N1'].includes(value);
}
