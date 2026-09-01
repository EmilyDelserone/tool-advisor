import { describe, it, expect } from 'vitest';
import rulesData from '../../src/data/rules.json';
import { loadRulesFile } from '../../src/engine/recommendationEngine';
import type { RulesFile } from '../../src/engine/types';

const rules = rulesData as RulesFile;

const EXPECTED_TOOL_IDS = [
  'power-automate',
  'power-apps',
  'copilot-studio',
  'azure-logic-apps',
  'azure-functions',
];

describe('rules.json schema validation (FR-013, SC-008)', () => {
  it('loads without throwing', () => {
    expect(() => loadRulesFile(rules)).not.toThrow();
  });

  it('defines exactly the five framework tools (FR-012)', () => {
    expect(rules.tools.map((t) => t.id).sort()).toEqual([...EXPECTED_TOOL_IDS].sort());
    rules.tools.forEach((tool) => {
      expect(tool.name.length).toBeGreaterThan(0);
      expect(tool.primaryUseCase.length).toBeGreaterThan(0);
    });
  });

  it('keeps all signal and red flag weights within 1-10', () => {
    [...rules.signals, ...rules.redFlags].forEach((item) => {
      expect(item.weight).toBeGreaterThanOrEqual(1);
      expect(item.weight).toBeLessThanOrEqual(10);
    });
  });

  it('maps every signal and red flag to known tools', () => {
    [...rules.signals, ...rules.redFlags].forEach((item) => {
      expect(item.applicableTools.length).toBeGreaterThan(0);
      item.applicableTools.forEach((toolId) => {
        expect(EXPECTED_TOOL_IDS).toContain(toolId);
      });
    });
  });

  it('has 5-7 core questions with unique ids and positions (FR-001)', () => {
    const coreQuestions = rules.questions.filter((q) => !q.isTiebreaker);
    expect(coreQuestions.length).toBeGreaterThanOrEqual(5);
    expect(coreQuestions.length).toBeLessThanOrEqual(7);

    const ids = rules.questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);

    const positions = rules.questions.map((q) => q.position);
    expect(new Set(positions).size).toBe(positions.length);
  });

  it('provides an answer mapping for every question option', () => {
    rules.questions.forEach((question) => {
      const optionIds = question.options
        ? question.options.map((o) => o.id)
        : ['yes', 'no'];

      optionIds.forEach((optionId) => {
        const mapping = rules.questionMappings.find(
          (m) => m.questionId === question.id && m.answerValue === optionId
        );
        expect(mapping, `missing mapping for ${question.id}/${optionId}`).toBeTruthy();
      });
    });
  });

  it('references only known signal and red flag ids in mappings', () => {
    const signalIds = rules.signals.map((s) => s.id);
    const redFlagIds = rules.redFlags.map((f) => f.id);

    rules.questionMappings.forEach((mapping) => {
      mapping.activatedSignalIds.forEach((id) => expect(signalIds).toContain(id));
      mapping.activatedRedFlagIds.forEach((id) => expect(redFlagIds).toContain(id));
    });
  });

  it('defines at least one tiebreaker wired to a tiebreaker question (FR-005a, SC-007)', () => {
    expect(rules.tiebreakers.length).toBeGreaterThanOrEqual(1);

    rules.tiebreakers.forEach((tiebreaker) => {
      const question = rules.questions.find((q) => q.id === tiebreaker.questionId);
      expect(question).toBeTruthy();
      expect(question!.isTiebreaker).toBe(true);
      expect(tiebreaker.appliesWhen.length).toBeGreaterThanOrEqual(2);
      expect(tiebreaker.discriminativeSignalIds.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('loadRulesFile rejects malformed data (FR-014)', () => {
  it('throws on unparseable JSON', () => {
    expect(() => loadRulesFile('{ not json')).toThrow(/Failed to parse/);
  });

  it('throws when required collections are missing', () => {
    const broken = { ...rules, tools: undefined } as unknown as RulesFile;

    expect(() => loadRulesFile(broken)).toThrow(/missing required fields/);
  });

  it('throws on an out-of-range signal weight', () => {
    const broken: RulesFile = {
      ...rules,
      signals: [{ ...rules.signals[0], weight: 42 }, ...rules.signals.slice(1)],
    };

    expect(() => loadRulesFile(broken)).toThrow(/Invalid signal weight/);
  });

  it('throws on an out-of-range red flag weight', () => {
    const broken: RulesFile = {
      ...rules,
      redFlags: [{ ...rules.redFlags[0], weight: 0 }, ...rules.redFlags.slice(1)],
    };

    expect(() => loadRulesFile(broken)).toThrow(/Invalid red flag weight/);
  });

  it('accepts a valid rules file parsed from a string', () => {
    expect(() => loadRulesFile(JSON.stringify(rules))).not.toThrow();
  });
});
