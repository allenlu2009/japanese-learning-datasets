/**
 * Example adapter for Claude web application
 * Shows how to convert between internal format and universal export format
 */

import {
  UniversalExport,
  TestRecord,
  TestType,
  TimestampUtils,
  BreakdownUtils,
  createExport
} from '../export-schema';

// Claude's internal test result format
interface ClaudeTestResult {
  testType: 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'mixed';
  timestamp: string; // Already ISO 8601
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  characterBreakdown?: {
    character: string;
    userSyllable: string;
    correctSyllables: string[];
  }[];
}

/**
 * Export Claude's test results to universal format
 */
export function exportClaudeData(results: ClaudeTestResult[]): UniversalExport {
  const tests: TestRecord[] = results.map(result => ({
    testType: result.testType as TestType,
    timestamp: result.timestamp, // Already ISO 8601
    totalQuestions: result.totalQuestions,
    correctAnswers: result.correctAnswers,
    scorePercentage: result.scorePercentage,
    jlptLevel: result.jlptLevel,
    breakdown: result.characterBreakdown
      ? BreakdownUtils.fromClaude(
          result.characterBreakdown,
          result.characterBreakdown.map(b => b.character).join('')
        )
      : undefined
  }));

  return createExport(tests, 'claude', 'web');
}

/**
 * Import universal format into Claude's format
 */
export function importToClaudeFormat(data: UniversalExport): ClaudeTestResult[] {
  return data.tests.map(test => ({
    testType: test.testType,
    timestamp: test.timestamp, // Already ISO 8601
    totalQuestions: test.totalQuestions,
    correctAnswers: test.correctAnswers,
    scorePercentage: test.scorePercentage,
    jlptLevel: test.jlptLevel,
    characterBreakdown: test.breakdown
      ? BreakdownUtils.toClaude(test.breakdown)
      : undefined
  }));
}

/**
 * Save to localStorage (Claude's current storage method)
 */
export function saveToLocalStorage(results: ClaudeTestResult[]): void {
  const exportData = exportClaudeData(results);
  localStorage.setItem('japanese-tests', JSON.stringify(exportData));
}

/**
 * Load from localStorage
 */
export function loadFromLocalStorage(): ClaudeTestResult[] {
  const data = localStorage.getItem('japanese-tests');
  if (!data) return [];

  const parsed = JSON.parse(data) as UniversalExport;
  return importToClaudeFormat(parsed);
}
