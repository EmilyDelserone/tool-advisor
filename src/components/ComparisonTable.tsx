import type { RunnerUpTool } from '../engine/types';

type ComparisonTableProps = {
  runnerUps: RunnerUpTool[];
};

export function ComparisonTable({ runnerUps }: ComparisonTableProps) {
  if (!runnerUps.length) {
    return null;
  }

  return (
    <section style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Runner-up options</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #dbe4f0' }}>
          <thead>
            <tr style={{ background: '#eff6ff' }}>
              <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #dbe4f0' }}>Tool</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #dbe4f0' }}>Use case</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #dbe4f0' }}>Why not this one?</th>
            </tr>
          </thead>
          <tbody>
            {runnerUps.map(({ tool, differentiationText }) => (
              <tr key={tool.id}>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>{tool.name}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>{tool.primaryUseCase}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>{differentiationText}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
