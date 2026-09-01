import { describe, it, expect } from 'vitest';
import { scoreTools } from '../../src/utils/scoring';
import type { RedFlag, Signal, Tool } from '../../src/engine/types';

const tools: Tool[] = [
  { id: 'tool-a', name: 'Tool A', description: 'A', primaryUseCase: 'A cases' },
  { id: 'tool-b', name: 'Tool B', description: 'B', primaryUseCase: 'B cases' },
];

const signals: Signal[] = [
  { id: 's1', text: 'Signal one', weight: 5, applicableTools: ['tool-a'] },
  { id: 's2', text: 'Signal two', weight: 3, applicableTools: ['tool-a', 'tool-b'] },
  { id: 's3', text: 'Signal three', weight: 9, applicableTools: ['tool-b'] },
];

const redFlags: RedFlag[] = [
  { id: 'r1', text: 'Red flag one', weight: 4, applicableTools: ['tool-a'] },
  { id: 'r2', text: 'Red flag two', weight: 10, applicableTools: ['tool-b'] },
];

const byId = (id: string, scores: ReturnType<typeof scoreTools>) =>
  scores.find((score) => score.toolId === id)!;

describe('scoreTools (FR-004a)', () => {
  it('sums matching signal weights per tool', () => {
    const scores = scoreTools(['s1', 's2'], [], signals, redFlags, tools);

    expect(byId('tool-a', scores).signalScore).toBe(8);
    expect(byId('tool-b', scores).signalScore).toBe(3);
  });

  it('ignores signals that do not apply to the tool', () => {
    const scores = scoreTools(['s3'], [], signals, redFlags, tools);

    expect(byId('tool-a', scores).signalScore).toBe(0);
    expect(byId('tool-a', scores).matchedSignalIds).toEqual([]);
    expect(byId('tool-b', scores).matchedSignalIds).toEqual(['s3']);
  });

  it('subtracts red flag weights to produce the net score', () => {
    const scores = scoreTools(['s1', 's2'], ['r1'], signals, redFlags, tools);
    const toolA = byId('tool-a', scores);

    expect(toolA.signalScore).toBe(8);
    expect(toolA.redFlagPenalty).toBe(4);
    expect(toolA.netScore).toBe(4);
  });

  it('allows negative net scores', () => {
    const scores = scoreTools([], ['r2'], signals, redFlags, tools);

    expect(byId('tool-b', scores).netScore).toBe(-10);
  });

  it('scores every tool even when nothing matches', () => {
    const scores = scoreTools([], [], signals, redFlags, tools);

    expect(scores).toHaveLength(tools.length);
    scores.forEach((score) => expect(score.netScore).toBe(0));
  });

  it('is deterministic for the same inputs', () => {
    const first = scoreTools(['s1', 's2'], ['r1'], signals, redFlags, tools);
    const second = scoreTools(['s1', 's2'], ['r1'], signals, redFlags, tools);

    expect(first).toEqual(second);
  });

  it('does not mutate its inputs', () => {
    const signalsCopy = structuredClone(signals);
    scoreTools(['s1'], ['r1'], signals, redFlags, tools);

    expect(signals).toEqual(signalsCopy);
  });
});
