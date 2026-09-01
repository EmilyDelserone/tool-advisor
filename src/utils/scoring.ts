import type { RedFlag, Signal, Tool, ToolScore } from '../engine/types';

/**
 * Score = sum(matching signal weights) - sum(matching red flag weights), per tool.
 */
export function scoreTools(
  activatedSignalIds: string[],
  activatedRedFlagIds: string[],
  signals: Signal[],
  redFlags: RedFlag[],
  tools: Tool[]
): ToolScore[] {
  return tools.map((tool) => {
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
}
