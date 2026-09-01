import type { RunnerUpTool } from '../engine/types';

type ComparisonTableProps = {
  runnerUps: RunnerUpTool[];
};

export function ComparisonTable({ runnerUps }: ComparisonTableProps) {
  if (!runnerUps.length) {
    return null;
  }

  return (
    <section className="comparison" aria-labelledby="comparison-heading">
      <h2 id="comparison-heading">Runner-up options</h2>
      <div className="comparison-scroll">
        {/* Explicit roles keep table semantics when rows stack on small screens */}
        <table className="comparison-table" role="table">
          <thead>
            <tr role="row">
              <th role="columnheader" scope="col">
                Tool
              </th>
              <th role="columnheader" scope="col">
                Use case
              </th>
              <th role="columnheader" scope="col">
                Why not this one?
              </th>
            </tr>
          </thead>
          <tbody>
            {runnerUps.map(({ tool, differentiationText }) => (
              <tr role="row" key={tool.id}>
                <td role="cell" data-label="Tool">
                  {tool.name}
                </td>
                <td role="cell" data-label="Use case">
                  {tool.primaryUseCase}
                </td>
                <td role="cell" data-label="Why not this one?">
                  {differentiationText}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
