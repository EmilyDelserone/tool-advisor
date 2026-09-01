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
  Question,
  QuestionMapping,
  RulesFile,
  ToolScore,
  Recommendation,
  RunnerUpTool,
} from './types';
import { scoreTools } from '../utils/scoring';
import { joinWithAnd, lowerFirst, pluralize } from '../utils/formatting';

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
  return scoreTools(activatedSignalIds, activatedRedFlagIds, signals, redFlags, tools);
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
 * Generate plain-language text explaining why a runner-up was not chosen.
 * Cites the runner-up's matched red flags and the framework signals it does not cover.
 */
export function generateRunnerUpDifferentiator(
  primaryTool: Tool,
  runnerUpTool: Tool,
  primaryScore: ToolScore,
  runnerUpScore: ToolScore,
  signals: Signal[],
  redFlags: RedFlag[]
): string {
  const parts: string[] = [];

  const missingSignals = signals.filter(
    (signal) =>
      primaryScore.matchedSignalIds.includes(signal.id) &&
      !runnerUpScore.matchedSignalIds.includes(signal.id)
  );

  const runnerUpFlags = redFlags.filter((flag) =>
    runnerUpScore.matchedRedFlagIds.includes(flag.id)
  );

  parts.push(`${runnerUpTool.name} covers ${runnerUpTool.primaryUseCase}.`);

  if (missingSignals.length > 0) {
    const texts = missingSignals.slice(0, 2).map((s) => lowerFirst(s.text));
    parts.push(
      `Your answers pointed to ${joinWithAnd(texts)}, which the framework maps to ${primaryTool.name} rather than ${runnerUpTool.name}.`
    );
  }

  if (runnerUpFlags.length > 0) {
    const texts = runnerUpFlags.slice(0, 2).map((f) => lowerFirst(f.text));
    parts.push(
      `It also hits the ${pluralize(runnerUpFlags.length, 'red flag')} ${joinWithAnd(texts)}.`
    );
  }

  if (missingSignals.length === 0 && runnerUpFlags.length === 0) {
    parts.push(
      `It scored ${primaryScore.netScore - runnerUpScore.netScore} points lower than ${primaryTool.name} on the framework signals your answers activated.`
    );
  }

  return parts.join(' ');
}

/**
 * Find the primary tool recommendation given user answers
 * Returns recommendation with justification and runner-ups
 */
export function findPrimaryRecommendation(
  answers: Answer[],
  rulesFile: RulesFile,
  preferredToolId?: string
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

  // A tiebreaker-resolved tool wins only when it is still tied for the top score
  if (preferredToolId) {
    const preferredIndex = sorted.findIndex((s) => s.toolId === preferredToolId);
    if (preferredIndex > 0 && sorted[preferredIndex].netScore === sorted[0].netScore) {
      const [preferred] = sorted.splice(preferredIndex, 1);
      sorted.unshift(preferred);
    }
  }

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
    const differentiationText = generateRunnerUpDifferentiator(
      primaryTool,
      tool,
      primaryToolScore,
      score,
      rulesFile.signals,
      rulesFile.redFlags
    );

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

export type WizardEvaluation =
  | { status: 'tiebreaker'; tiebreakerQuestion: Question; tiedToolIds: string[] }
  | { status: 'resolved'; recommendation: Recommendation };

/**
 * Decide whether the answers so far resolve to a recommendation or still need a tiebreaker.
 */
export function evaluateAnswers(
  answers: Answer[],
  rulesFile: RulesFile
): WizardEvaluation {
  const activatedSignalIds = Array.from(
    new Set(answers.flatMap((a) => a.activatedSignalIds))
  );
  const activatedRedFlagIds = Array.from(
    new Set(answers.flatMap((a) => a.activatedRedFlagIds))
  );

  const toolScores = calculateToolScores(
    activatedSignalIds,
    activatedRedFlagIds,
    rulesFile.signals,
    rulesFile.redFlags,
    rulesFile.tools
  );

  const { isTie, tiedToolIds } = detectTie(toolScores);

  if (!isTie) {
    return { status: 'resolved', recommendation: findPrimaryRecommendation(answers, rulesFile) };
  }

  const applicable = (rulesFile.tiebreakers ?? []).filter((tb) =>
    tiedToolIds.every((toolId) => tb.appliesWhen.includes(toolId))
  );

  const unanswered = applicable.find(
    (tb) => !answers.some((a) => a.questionId === tb.questionId)
  );

  if (unanswered) {
    const tiebreakerQuestion = rulesFile.questions.find(
      (q) => q.id === unanswered.questionId
    );

    if (tiebreakerQuestion) {
      return { status: 'tiebreaker', tiebreakerQuestion, tiedToolIds };
    }
  }

  // Tiebreaker already answered (or none defined): resolve deterministically
  const answeredTiebreaker = applicable
    .map((tb) => answers.find((a) => a.questionId === tb.questionId))
    .find((a): a is Answer => Boolean(a));

  const preferredToolId = answeredTiebreaker
    ? applyTiebreakerSignals(
        answeredTiebreaker,
        tiedToolIds,
        rulesFile.signals,
        rulesFile.redFlags,
        rulesFile.tools
      ).resolvedToolId
    : undefined;

  return {
    status: 'resolved',
    recommendation: findPrimaryRecommendation(answers, rulesFile, preferredToolId),
  };
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
