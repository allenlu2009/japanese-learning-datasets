/**
 * Example adapter for Gemini (Web & Mobile)
 * Shows how to convert between Gemini's internal format and universal export format
 */

import {
  UniversalExport,
  TestRecord,
  CharacterAttemptRecord,
  TestType,
  TimestampUtils
} from '../export-schema';

// Gemini's internal types (matching japanese-learning-app/types/testTypes.ts)
interface GeminiTestResult {
  id: string;
  testType: string; // 'Kana' | 'Kanji' | 'Vocabulary'
  date: string;     // ISO 8601
  score: number;    // Raw correct count
  numQuestions: number;
  level: string;    // 'N5', 'N4', or 'N/A'
  mode: string;     // '1-character', 'mixed', etc.
}

interface GeminiCharacterAttempt {
  id: string;
  testId: string;
  timestamp: string;
  character: string;
  scriptType: string;
  userAnswer: string;
  correctAnswers: string[];
  isCorrect: boolean;
  jlptLevel?: string;
  characterType?: string;
}

/**
 * Export Gemini's test results to universal format
 */
export function exportGeminiData(
  results: GeminiTestResult[], 
  attempts: GeminiCharacterAttempt[]
): UniversalExport {
  const tests: TestRecord[] = results.map(result => ({
    id: result.id,
    timestamp: TimestampUtils.toISO(result.date),
    testType: result.testType.toLowerCase() as TestType,
    score: Math.round((result.score / result.numQuestions) * 100),
    totalQuestions: result.numQuestions,
    correctAnswers: result.score,
    jlptLevel: result.level !== 'N/A' ? result.level as any : undefined,
    difficulty: result.mode !== 'N/A' ? result.mode : undefined,
  }));

  const attemptRecords: CharacterAttemptRecord[] = attempts.map(attempt => ({
    id: attempt.id,
    testId: attempt.testId,
    timestamp: TimestampUtils.toISO(attempt.timestamp),
    prompt: attempt.character,
    expected: attempt.correctAnswers,
    response: attempt.userAnswer,
    correct: attempt.isCorrect,
    scriptType: attempt.scriptType.toLowerCase() as any,
    jlptLevel: attempt.jlptLevel,
    characterType: attempt.characterType as any,
  }));

  return {
    version: "1.0",
    exportedAt: TimestampUtils.now(),
    tests,
    attempts: attemptRecords,
    settings: {}, // Placeholder for app settings
    meta: {
      exportedBy: "gemini",
      platform: "web" // or "mobile"
    }
  };
}

/**
 * Import universal format into Gemini's Web format (localStorage)
 */
export function importToGeminiWeb(data: UniversalExport) {
  const interactiveTests: GeminiTestResult[] = data.tests.map(test => ({
    id: test.id,
    testType: test.testType.charAt(0).toUpperCase() + test.testType.slice(1),
    date: test.timestamp,
    score: test.correctAnswers,
    numQuestions: test.totalQuestions,
    level: test.jlptLevel || 'N/A',
    mode: test.difficulty || 'N/A'
  }));

  const characterAttempts: GeminiCharacterAttempt[] = data.attempts.map(attempt => ({
    id: attempt.id,
    testId: attempt.testId,
    timestamp: attempt.timestamp,
    character: attempt.prompt,
    scriptType: attempt.scriptType,
    userAnswer: attempt.response,
    correctAnswers: attempt.expected,
    isCorrect: attempt.correct,
    jlptLevel: attempt.jlptLevel,
    characterType: attempt.characterType
  }));

  return { interactiveTests, characterAttempts };
}
