/**
 * Core type definitions for the Microsoft Tool Advisor recommendation engine
 * These types define the data structures used throughout the application
 */

export interface Tool {
  id: string;
  name: string;
  description: string;
  primaryUseCase: string;
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
  matchedSignalIds: string[];
  matchedRedFlagIds: string[];
}

export interface RunnerUpTool {
  tool: Tool;
  score: number;
  differentiationText: string;
  matchedSignalIds: string[];
}

export interface Recommendation {
  primaryTool: Tool;
  score: number;
  justification: string;
  matchedSignalIds: string[];
  matchedRedFlagIds: string[];
  runnerUps: RunnerUpTool[];
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
