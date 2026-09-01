import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Title2,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import type { RunnerUpTool } from '../engine/types';

type ComparisonTableProps = {
  runnerUps: RunnerUpTool[];
};

const useStyles = makeStyles({
  section: {
    marginTop: tokens.spacingVerticalXXL,
  },
  heading: {
    display: 'block',
    marginBottom: tokens.spacingVerticalM,
  },
  scroll: {
    overflowX: 'auto',
  },
});

export function ComparisonTable({ runnerUps }: ComparisonTableProps) {
  const styles = useStyles();

  if (!runnerUps.length) {
    return null;
  }

  return (
    <section className={styles.section} aria-labelledby="comparison-heading">
      <Title2 as="h2" id="comparison-heading" className={styles.heading}>
        Runner-up options
      </Title2>
      {/* tabIndex keeps the horizontally scrollable region reachable by keyboard */}
      <div
        className={styles.scroll}
        tabIndex={0}
        role="region"
        aria-labelledby="comparison-heading"
      >
        {/* Explicit roles keep table semantics when rows stack on small screens */}
        <Table className="comparison-table" role="table" aria-label="Runner-up comparison">
          <TableHeader>
            <TableRow role="row">
              <TableHeaderCell role="columnheader" scope="col">
                Tool
              </TableHeaderCell>
              <TableHeaderCell role="columnheader" scope="col">
                Use case
              </TableHeaderCell>
              <TableHeaderCell role="columnheader" scope="col">
                Why not this one?
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runnerUps.map(({ tool, differentiationText }) => (
              <TableRow role="row" key={tool.id}>
                <TableCell role="cell" data-label="Tool">
                  {tool.name}
                </TableCell>
                <TableCell role="cell" data-label="Use case">
                  {tool.primaryUseCase}
                </TableCell>
                <TableCell role="cell" data-label="Why not this one?">
                  {differentiationText}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
