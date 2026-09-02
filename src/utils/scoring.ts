import type { RedFlag, Signal, Tool, ToolScore } from '../engine/types';

/**
 * Score = sum(matching signal weights) - sum(matching red flag weights), per tool.
 *
 * fitScore expresses that same result as a 0-100 percentage: each tool's net score as a share of the
 * strongest signal match in this run. The shared denominator keeps the percentage ordering identical
 * to the net score ordering, so the winner can never display a lower percentage than a runner-up.
 */
export function scoreTools(
  activatedSignalIds: string[],
  activatedRedFlagIds: string[],
  signals: Signal[],
  redFlags: RedFlag[],
  tools: Tool[]
): ToolScore[] {
  const raw = tools.map((tool) => {
    const matchedSignals = signals.filter(
      (signal) =>
        activatedSignalIds.includes(signal.id) && signal.applicableTools.includes(tool.id)
    );

    const matchedRedFlags = redFlags.filter(
      (flag) => activatedRedFlagIds.includes(flag.id) && flag.applicableTools.includes(tool.id)
    );

    const signalScore = matchedSignals.reduce((sum, signal) => sum + signal.weight, 0);
    const redFlagPenalty = matchedRedFlags.reduce((sum, flag) => sum + flag.weight, 0);

    return {
      toolId: tool.id,
      signalScore,
      redFlagPenalty,
      netScore: signalScore - redFlagPenalty,
      matchedSignalIds: matchedSignals.map((s) => s.id),
      matchedRedFlagIds: matchedRedFlags.map((f) => f.id),
    };
  });

  const bestSignalScore = Math.max(0, ...raw.map((score) => score.signalScore));

  return raw.map((score) => ({
    ...score,
    fitScore:
      bestSignalScore === 0 ? 0 : Math.round((Math.max(0, score.netScore) / bestSignalScore) * 100),
  }));
}
