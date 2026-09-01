import { Fragment, type ReactNode } from 'react';
import { glossary, type GlossaryEntry } from '../data/glossary';
import { GlossaryTerm } from './GlossaryTerm';

type GlossaryTextProps = {
  text: string;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Longest patterns first so "integrating multiple systems" wins over "integration"
const patternToEntry = glossary
  .flatMap((entry) => entry.patterns.map((pattern) => ({ pattern, entry })))
  .sort((a, b) => b.pattern.length - a.pattern.length);

const matcher = new RegExp(
  `\\b(${patternToEntry.map(({ pattern }) => escapeRegExp(pattern)).join('|')})\\b`,
  'gi'
);

const entryFor = (match: string): GlossaryEntry | undefined =>
  patternToEntry.find(({ pattern }) => pattern.toLowerCase() === match.toLowerCase())?.entry;

/**
 * Renders text with an inline definition popover after the first mention of each technical term.
 */
export function GlossaryText({ text }: GlossaryTextProps) {
  const seen = new Set<string>();
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(matcher)) {
    const entry = entryFor(match[0]);
    if (!entry || seen.has(entry.id) || match.index === undefined) {
      continue;
    }

    seen.add(entry.id);
    parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <Fragment key={`${entry.id}-${match.index}`}>
        {match[0]}
        <GlossaryTerm entry={entry} />
      </Fragment>
    );
    lastIndex = match.index + match[0].length;
  }

  if (parts.length === 0) {
    return <>{text}</>;
  }

  parts.push(text.slice(lastIndex));

  return <>{parts}</>;
}

export function findGlossaryEntry(text: string): GlossaryEntry | undefined {
  const match = text.match(matcher);
  return match ? entryFor(match[0]) : undefined;
}
