import type { Recommendation } from '../engine/types';
import { ComparisonTable } from './ComparisonTable';

type RecommendationResultProps = {
  recommendation: Recommendation;
  onRestart: () => void;
};

export function RecommendationResult({ recommendation, onRestart }: RecommendationResultProps) {
  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>
      <section
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1d4ed8' }}>
          Recommended tool
        </p>
        <h1 style={{ margin: '0.5rem 0 1rem', fontSize: '2.5rem', color: '#0f172a' }}>
          {recommendation.primaryTool.name}
        </h1>
        <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.7, color: '#334155' }}>
          {recommendation.justification}
        </p>

        <div style={{ marginTop: '1rem' }}>
          <button
            type="button"
            onClick={onRestart}
            style={{
              border: 'none',
              borderRadius: '10px',
              background: '#2563eb',
              color: '#fff',
              padding: '0.8rem 1.25rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Start over
          </button>
        </div>
      </section>

      <ComparisonTable runnerUps={recommendation.runnerUps} />
    </main>
  );
}
