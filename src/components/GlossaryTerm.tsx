import { useState } from 'react';
import {
  Button,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import type { GlossaryEntry } from '../data/glossary';

type GlossaryTermProps = {
  entry: GlossaryEntry;
};

const useStyles = makeStyles({
  trigger: {
    minWidth: '32px',
    width: '32px',
    height: '32px',
    padding: 0,
    marginLeft: tokens.spacingHorizontalXXS,
    verticalAlign: 'middle',
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightBold,
  },
  surface: {
    maxWidth: '320px',
    display: 'grid',
    gap: tokens.spacingVerticalS,
  },
  term: {
    fontWeight: tokens.fontWeightBold,
  },
  example: {
    color: tokens.colorNeutralForeground2,
  },
});

/**
 * Hover, tap, and keyboard all reveal the definition. Hover is restricted to real mouse pointers so
 * a touch tap is not opened by a synthesized hover and then closed again by the click.
 */
export function GlossaryTerm({ entry }: GlossaryTermProps) {
  const styles = useStyles();
  const [open, setOpen] = useState(false);

  return (
    <Popover
      withArrow
      open={open}
      onOpenChange={(_, data) => setOpen(data.open)}
      trapFocus={false}
      positioning="above"
    >
      <PopoverTrigger disableButtonEnhancement>
        <Button
          className={styles.trigger}
          appearance="transparent"
          shape="circular"
          size="small"
          type="button"
          aria-label={`What does "${entry.term}" mean?`}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') {
              setOpen(true);
            }
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === 'mouse') {
              setOpen(false);
            }
          }}
        >
          ⓘ
        </Button>
      </PopoverTrigger>

      <PopoverSurface className={styles.surface}>
        <Text className={styles.term}>{entry.term}</Text>
        <Text>{entry.definition}</Text>
        <Text size={200} className={styles.example}>
          <strong>Example:</strong> {entry.example}
        </Text>
      </PopoverSurface>
    </Popover>
  );
}
