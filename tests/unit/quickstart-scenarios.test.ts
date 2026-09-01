import { describe, it, expect } from 'vitest';
import rulesData from '../../src/data/rules.json';
import {
  PARTIAL_MATCH_CAVEAT,
  PARTIAL_MATCH_THRESHOLD,
  answerToSignals,
  findPrimaryRecommendation,
} from '../../src/engine/recommendationEngine';
import type { Answer, RulesFile } from '../../src/engine/types';

const rules = rulesData as RulesFile;

const coreQuestions = rules.questions
  .filter((q) => !q.isTiebreaker)
  .sort((a, b) => a.position - b.position);

const buildAnswers = (values: string[]): Answer[] =>
  coreQuestions.map((question, index) => {
    const mapped = answerToSignals(question.id, values[index], rules.questionMappings);

    return {
      questionId: question.id,
      value: values[index],
      timestamp: 0,
      activatedSignalIds: mapped.signalIds,
      activatedRedFlagIds: mapped.redFlagIds,
    };
  });

// quickstart.md scenarios 1-4 plus the Logic Apps enterprise-integration case
const SCENARIOS: Array<{ name: string; answers: string[]; expected: string }> = [
  {
    name: 'Scenario 1 - backend automation on a schedule',
    answers: ['no', 'no', 'no', 'yes', 'no', 'internal', 'no'],
    expected: 'Power Automate',
  },
  {
    name: 'Scenario 2 - user-facing data entry app',
    answers: ['yes', 'no', 'no', 'no', 'no', 'internal', 'no'],
    expected: 'Power Apps',
  },
  {
    name: 'Scenario 3 - custom code and event-driven compute',
    answers: ['no', 'yes', 'no', 'yes', 'no', 'internal', 'no'],
    expected: 'Azure Functions',
  },
  {
    name: 'Scenario 4 - natural language self-service',
    answers: ['no', 'no', 'no', 'no', 'yes', 'internal', 'no'],
    expected: 'Copilot Studio',
  },
  {
    name: 'Scenario 5 - enterprise / on-prem integration',
    answers: ['no', 'no', 'yes', 'yes', 'no', 'internal', 'yes'],
    expected: 'Azure Logic Apps',
  },
];

describe('quickstart.md recommendation scenarios (SC-002)', () => {
  it.each(SCENARIOS)('$name recommends $expected', ({ answers, expected }) => {
    const recommendation = findPrimaryRecommendation(buildAnswers(answers), rules);

    expect(recommendation.primaryTool.name).toBe(expected);
    expect(recommendation.matchedSignalIds.length).toBeGreaterThan(0);
    expect(recommendation.runnerUps.length).toBeGreaterThanOrEqual(1);
  });

  it('covers every tool across the scenario set (FR-012)', () => {
    const recommended = SCENARIOS.map(
      ({ answers }) => findPrimaryRecommendation(buildAnswers(answers), rules).primaryTool.id
    );

    expect(new Set(recommended).size).toBe(rules.tools.length);
  });
});

describe('partial match caveat (FR-015)', () => {
  it('adds the caveat when the winning score is at or below the threshold', () => {
    const weak = findPrimaryRecommendation(
      buildAnswers(['no', 'yes', 'no', 'no', 'no', 'external', 'no']),
      rules
    );

    expect(weak.score).toBeLessThanOrEqual(PARTIAL_MATCH_THRESHOLD);
    expect(weak.justification).toContain(PARTIAL_MATCH_CAVEAT);
  });

  it('omits the caveat for a strong match', () => {
    const strong = findPrimaryRecommendation(
      buildAnswers(['no', 'no', 'yes', 'yes', 'no', 'internal', 'yes']),
      rules
    );

    expect(strong.score).toBeGreaterThan(PARTIAL_MATCH_THRESHOLD);
    expect(strong.justification).not.toContain(PARTIAL_MATCH_CAVEAT);
  });
});
