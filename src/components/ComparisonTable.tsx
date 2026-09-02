import { Fragment, useState } from 'react';
import {
  Button,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  Title2,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import type { RunnerUpTool } from '../engine/types';
import { FitScoreBar } from './FitScoreBar';
import { GlossaryText } from './GlossaryText';

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
  toolCell: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
    justifyItems: 'start',
  },
  toolName: {
    fontWeight: tokens.fontWeightSemibold,
  },
  detailsToggle: {
    marginTop: tokens.spacingVerticalXS,
    minHeight: '32px',
  },
  detailsRow: {
    backgroundColor: tokens.colorNeutralBackground2,
  },
  detailsList: {
    margin: 0,
    paddingLeft: tokens.spacingHorizontalXXL,
    display: 'grid',
    gap: tokens.spacingVerticalXS,
  },
  detailsIntro: {
    display: 'block',
    marginBottom: tokens.spacingVerticalS,
    fontWeight: tokens.fontWeightSemibold,
  },
});

export function ComparisonTable({ runnerUps }: ComparisonTableProps) {
  const styles = useStyles();
  const [expanded, setExpanded] = useState<string[]>([]);

  if (!runnerUps.length) {
    return null;
  }

  const toggle = (toolId: string) =>
    setExpanded((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );

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
            {runnerUps.map((runnerUp) => {
              const { tool, differentiationText, fitScore, redFlagBreakdown, redFlagPenalty } =
                runnerUp;
              const isExpanded = expanded.includes(tool.id);
              const detailsId = `details-${tool.id}`;

              return (
                <Fragment key={tool.id}>
                  <TableRow role="row">
                    <TableCell role="cell" data-label="Tool">
                      <span className={styles.toolCell}>
                        <span className={styles.toolName}>{tool.name}</span>
                        <FitScoreBar toolName={tool.name} fitScore={fitScore} />
                        <Link href={tool.docsUrl} target="_blank" rel="noopener noreferrer">
                          Learn more about {tool.name} (opens in a new tab)
                        </Link>
                        <Button
                          className={styles.detailsToggle}
                          appearance="subtle"
                          size="small"
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={detailsId}
                          onClick={() => toggle(tool.id)}
                        >
                          {isExpanded ? 'Hide' : 'Show'} what lowered {tool.name}&apos;s score
                        </Button>
                      </span>
                    </TableCell>
                    <TableCell role="cell" data-label="Use case">
                      <GlossaryText text={tool.primaryUseCase} />
                    </TableCell>
                    <TableCell role="cell" data-label="Why not this one?">
                      <GlossaryText text={differentiationText} />
                    </TableCell>
                  </TableRow>

                  {isExpanded ? (
                    <TableRow role="row" className={styles.detailsRow}>
                      <TableCell role="cell" colSpan={3} id={detailsId}>
                        {redFlagBreakdown.length > 0 ? (
                          <>
                            <Text className={styles.detailsIntro}>
                              These framework red flags cost {tool.name} {redFlagPenalty} point
                              {redFlagPenalty === 1 ? '' : 's'}:
                            </Text>
                            <ul className={styles.detailsList}>
                              {redFlagBreakdown.map((flag) => (
                                <li key={flag.id}>
                                  <Text>
                                    <GlossaryText text={flag.text} /> (−{flag.weight} points)
                                  </Text>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <Text>
                            No red flags were triggered for {tool.name}. It simply matched fewer of
                            the signals in your answers than the recommended tool.
                          </Text>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
