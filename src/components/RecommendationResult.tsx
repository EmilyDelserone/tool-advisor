import type { Recommendation } from '../engine/types';
import { ComparisonTable } from './ComparisonTable';

type RecommendationResultProps = {
  recommendation: Recommendation;
  onRestart: () => void;
};

export function RecommendationResult({ recommendation, onRestart }: RecommendationResultProps) {
  return (
    <main className="result-shell">
      <section className="result-card">
        <p className="result-eyebrow">Recommended tool</p>
        <h1 className="result-title">{recommendation.primaryTool.name}</h1>
        <p className="result-justification">{recommendation.justification}</p>

        <div className="result-actions">
          <button type="button" className="button button-primary" onClick={onRestart}>
            Start over
          </button>
        </div>
      </section>

      <ComparisonTable runnerUps={recommendation.runnerUps} />
    </main>
  );
}
