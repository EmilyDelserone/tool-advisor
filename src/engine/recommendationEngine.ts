/**
 * Microsoft Tool Advisor - Recommendation Engine
 * Pure TypeScript functions for deterministic tool recommendations
 * Based on weighted scoring of framework signals and red flags
 */

import type {
  Signal,
  RedFlag,
  Tool,
  Answer,
  QuestionMapping,
  RulesFile,
  ToolScore,
  Recommendation,
  RunnerUpTool,
} from './types';

/**
 * Maps a user's answer to activated signals and red flags
 * Based on the question mappings in rules.json
 */
export function answerToSignals(
  questionId: string,
  answerValue: string,
  questionMappings: QuestionMapping[]
): { signalIds: string[]; redFlagIds: string[] } {
  const mapping = questionMappings.find(
    (m) => m.questionId === questionId && m.answerValue === answerValue
  );

  if (!mapping) {
    return { signalIds: [], redFlagIds: [] };
  }

  return {
    signalIds: mapping.activatedSignalIds || [],
    redFlagIds: mapping.activatedRedFlagIds || [],
  };
}

/**
 * Calculate scores for all tools based on activated signals and red flags
 * Score = sum(matching signals × weight) - sum(matching red flags × weight)
 */
export function calculateToolScores(
  activatedSignalIds: string[],
  activatedRedFlagIds: string[],
  signals: Signal[],
  redFlags: RedFlag[],
  tools: Tool[]
): ToolScore[] {
  return tools.map((tool) => {
    // Find matching signals for this tool
    const matchedSignals = signals.filter(
      (signal) =>
        activatedSignalIds.includes(signal.id) &&
        signal.applicableTools.includes(tool.id)
    );

    // Calculate signal score
    const signalScore = matchedSignals.reduce(
      (sum, signal) => sum + signal.weight,
      0
    );

    // Find matching red flags for this tool
    const matchedRedFlags = redFlags.filter(
      (flag) =>
        activatedRedFlagIds.includes(flag.id) &&
        flag.applicableTools.includes(tool.id)
    );

    // Calculate red flag penalty
    const redFlagPenalty = matchedRedFlags.reduce(
      (sum, flag) => sum + flag.weight,
      0
    );

    // Net score = signals - red flags (can be negative)
    const netScore = signalScore - redFlagPenalty;

    return {
      toolId: tool.id,
      signalScore,
      redFlagPenalty,
      netScore,
      matchedSignalIds: matchedSignals.map((s) => s.id),
      matchedRedFlagIds: matchedRedFlags.map((f) => f.id),
    };
  });
}

/**
 * Detect if the top-scoring tools are tied
 * Returns { isTie: boolean, tiedToolIds: string[] }
 */
export function detectTie(toolScores: ToolScore[]): {
  isTie: boolean;
  tiedToolIds: string[];
} {
  if (toolScores.length === 0) {
    return { isTie: false, tiedToolIds: [] };
  }

  // Sort by net score descending
  const sorted = [...toolScores].sort((a, b) => b.netScore - a.netScore);

  // Check if top score is tied with 2nd place
  const topScore = sorted[0].netScore;
  const tiedTools = sorted
    .filter((score) => score.netScore === topScore)
    .map((score) => score.toolId);

  return {
    isTie: tiedTools.length > 1,
    tiedToolIds: tiedTools,
  };
}

/**
 * Apply tiebreaker signals to break a tie between multiple tools
 * Returns the resolved tool ID and final scores
 */
export function applyTiebreakerSignals(
  tiebreakerAnswer: Answer,
  tiedToolIds: string[],
  signals: Signal[],
  redFlags: RedFlag[],
  tools: Tool[]
): { resolvedToolId: string; finalScores: ToolScore[] } {
  // Filter tools to only the tied ones
  const tiedTools = tools.filter((t) => tiedToolIds.includes(t.id));

  // Calculate scores for tied tools with tiebreaker signals applied
  const tiebreakerSignals = tiebreakerAnswer.activatedSignalIds;
  const tiebreakerRedFlags = tiebreakerAnswer.activatedRedFlagIds;

  const finalScores = calculateToolScores(
    tiebreakerSignals,
    tiebreakerRedFlags,
    signals,
    redFlags,
    tiedTools
  );

  // Sort by final net score
  const sorted = [...finalScores].sort((a, b) => b.netScore - a.netScore);

  // If still tied after tiebreaker, select highest weight signal match
  if (
    sorted.length > 1 &&
    sorted[0].netScore === sorted[1].netScore
  ) {
    // Use highest signal score as secondary sort criterion
    const sorted2 = sorted.sort(
      (a, b) => b.signalScore - a.signalScore
    );
    return {
      resolvedToolId: sorted2[0].toolId,
      finalScores: sorted,
    };
  }

  return {
    resolvedToolId: sorted[0].toolId,
    finalScores: sorted,
  };
}

/**
 * Generate plain-language justification for a recommendation
 * Cites specific signals and red flags from the framework
 */
export function generateJustification(
  matchedSignalIds: string[],
  matchedRedFlagIds: string[],
  signals: Signal[],
  redFlags: RedFlag[]
): string {
  const matchedSignals = signals.filter((s) => matchedSignalIds.includes(s.id));
  const matchedFlags = redFlags.filter((f) => matchedRedFlagIds.includes(f.id));

  // Build justification from signals and red flags
  const parts: string[] = [];

  if (matchedSignals.length > 0) {
    const signalTexts = matchedSignals
      .slice(0, 2) // Take top 2 signals
      .map((s) => s.text);
    parts.push(`This recommendation aligns with your needs: ${signalTexts.join(' and ')}.`);
  }

  if (matchedFlags.length > 0) {
    const flagTexts = matchedFlags
      .slice(0, 1) // Take top red flag
      .map((f) => f.text);
    parts.push(`It also avoids constraints like: ${flagTexts.join(' and ')}.`);
  }

  if (parts.length === 0) {
    return 'This is the best fit based on your requirements.';
  }

  return parts.join(' ');
}

/**
 * Find the primary tool recommendation given user answers
 * Returns recommendation with justification and runner-ups
 */
export function findPrimaryRecommendation(
  answers: Answer[],
  rulesFile: RulesFile
): Recommendation {
  // Aggregate all activated signals and red flags from all answers
  const allActivatedSignalIds: string[] = [];
  const allActivatedRedFlagIds: string[] = [];

  answers.forEach((answer) => {
    allActivatedSignalIds.push(...answer.activatedSignalIds);
    allActivatedRedFlagIds.push(...answer.activatedRedFlagIds);
  });

  // Remove duplicates
  const uniqueSignalIds = Array.from(new Set(allActivatedSignalIds));
  const uniqueRedFlagIds = Array.from(new Set(allActivatedRedFlagIds));

  // Calculate scores for all tools
  const toolScores = calculateToolScores(
    uniqueSignalIds,
    uniqueRedFlagIds,
    rulesFile.signals,
    rulesFile.redFlags,
    rulesFile.tools
  );

  // Sort by net score descending
  const sorted = [...toolScores].sort((a, b) => b.netScore - a.netScore);

  // Get primary tool
  const primaryToolScore = sorted[0];
  const primaryTool = rulesFile.tools.find(
    (t) => t.id === primaryToolScore.toolId
  )!;

  // Generate justification
  const justification = generateJustification(
    primaryToolScore.matchedSignalIds,
    primaryToolScore.matchedRedFlagIds,
    rulesFile.signals,
    rulesFile.redFlags
  );

  // Get runner-up tools (2nd and 3rd place, up to 2 tools)
  const runnerUpScores = sorted.slice(1, 3);
  const runnerUps: RunnerUpTool[] = runnerUpScores.map((score) => {
    const tool = rulesFile.tools.find((t) => t.id === score.toolId)!;
    const differentiationText = `${tool.name} is great for ${tool.primaryUseCase}, but ${primaryTool.name} is the better fit for your specific needs.`;

    return {
      tool,
      score: score.netScore,
      differentiationText,
      matchedSignalIds: score.matchedSignalIds,
    };
  });

  const recommendation: Recommendation = {
    primaryTool,
    score: primaryToolScore.netScore,
    justification,
    matchedSignalIds: primaryToolScore.matchedSignalIds,
    matchedRedFlagIds: primaryToolScore.matchedRedFlagIds,
    runnerUps,
    generatedAt: Date.now(),
    questionsAnswered: answers.length,
  };

  return recommendation;
}

/**
 * Load rules.json from a JSON object or string
 * Validates schema and returns typed RulesFile
 */
export function loadRulesFile(rulesData: RulesFile | string): RulesFile {
  let rules: RulesFile;

  if (typeof rulesData === 'string') {
    try {
      rules = JSON.parse(rulesData);
    } catch (error) {
      throw new Error(`Failed to parse rules.json: ${error}`);
    }
  } else {
    rules = rulesData;
  }

  // Validate required fields
  if (!rules.tools || !rules.signals || !rules.redFlags || !rules.questions) {
    throw new Error('Invalid rules.json: missing required fields');
  }

  // Validate all signals have weights 1-10
  rules.signals.forEach((signal) => {
    if (signal.weight < 1 || signal.weight > 10) {
      throw new Error(
        `Invalid signal weight for ${signal.id}: must be 1-10`
      );
    }
  });

  // Validate all red flags have weights 1-10
  rules.redFlags.forEach((flag) => {
    if (flag.weight < 1 || flag.weight > 10) {
      throw new Error(
        `Invalid red flag weight for ${flag.id}: must be 1-10`
      );
    }
  });

  return rules;
}
