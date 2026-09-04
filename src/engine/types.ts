/**
 * Core type definitions for the Microsoft Tool Advisor recommendation engine
 * These types define the data structures used throughout the application
 */

export interface Tool {
  id: string;
  name: string;
  description: string;
  primaryUseCase: string;
  docsUrl: string;
}

export interface Signal {
  id: string;
  text: string;
  weight: number; // 1-10 scale
  applicableTools: string[]; // tool IDs
}

export interface RedFlag {
  id: string;
  text: string;
  weight: number; // 1-10 scale
  applicableTools: string[]; // tool IDs
}

export interface Question {
  id: string;
  text: string;
  type: 'yes-no' | 'multiple-choice';
  position: number; // 1-7 for core questions, 8+ for tiebreaker
  options?: Array<{
    id: string;
    label: string;
  }>;
  isTiebreaker?: boolean;
}

export interface QuestionMapping {
  questionId: string;
  answerValue: string;
  activatedSignalIds: string[];
  activatedRedFlagIds: string[];
}

export interface Answer {
  questionId: string;
  value: string;
  timestamp: number;
  activatedSignalIds: string[];
  activatedRedFlagIds: string[];
}

export interface ToolScore {
  toolId: string;
  signalScore: number;
  redFlagPenalty: number;
  netScore: number;
  /** 0-100 share of the strongest signal match, after red flag penalties */
  fitScore: number;
  matchedSignalIds: string[];
  matchedRedFlagIds: string[];
}

/** A single framework item and the weight it contributed to (or removed from) a tool's score */
export interface ScoreContribution {
  id: string;
  text: string;
  weight: number;
}

export interface RunnerUpTool {
  tool: Tool;
  score: number;
  fitScore: number;
  differentiationText: string;
  matchedSignalIds: string[];
  matchedRedFlagIds: string[];
  /** Red flags that reduced this tool's fit score, heaviest first */
  redFlagBreakdown: ScoreContribution[];
  redFlagPenalty: number;
}

export interface ComboPattern {
  id: string;
  requiredSignalIds: string[];
  toolIds: string[];
  roles: string[];
}

export interface ComboTool {
  tool: Tool;
  role: string;
}

export interface Recommendation {
  primaryTool: Tool;
  score: number;
  fitScore: number;
  justification: string;
  matchedSignalIds: string[];
  matchedRedFlagIds: string[];
  runnerUps: RunnerUpTool[];
  comboTools?: ComboTool[];
  comboPatternId?: string;
  generatedAt: number;
  questionsAnswered: number;
}

export interface TiebreakerQuestion {
  id: string;
  questionId: string;
  appliesWhen: string[]; // tool IDs that are tied
  discriminativeSignalIds: string[];
}

export interface RulesFile {
  version: string;
  tools: Tool[];
  signals: Signal[];
  redFlags: RedFlag[];
  questions: Question[];
  questionMappings: QuestionMapping[];
  tiebreakers: TiebreakerQuestion[];
  comboPatterns?: ComboPattern[];
  metadata: {
    lastUpdated: string;
    frameworkVersion: string;
  };
}

export interface WizardState {
  currentQuestionIndex: number;
  answers: Answer[];
  showRecommendation: boolean;
  recommendation?: Recommendation;
  showTiebreaker: boolean;
  tiebreakerQuestion?: Question;
}
