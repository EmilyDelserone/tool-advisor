import {
  Bot24Regular,
  Code24Regular,
  Flow24Regular,
  Flowchart24Regular,
  WindowApps24Regular,
} from '@fluentui/react-icons';
import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import type { FC } from 'react';

type ToolIconProps = {
  toolId: string;
  size?: 'medium' | 'large';
};

/**
 * MIT-licensed Fluent system glyphs, not Microsoft product icons: the official Power Platform and
 * Azure icon sets are licensed for diagrams, training materials, and documentation only.
 */
const ICONS: Record<string, FC<{ className?: string }>> = {
  'power-automate': Flow24Regular,
  'power-apps': WindowApps24Regular,
  'copilot-studio': Bot24Regular,
  'azure-logic-apps': Flowchart24Regular,
  'azure-functions': Code24Regular,
};

const useStyles = makeStyles({
  icon: {
    flexShrink: 0,
    color: tokens.colorBrandForeground1,
  },
  medium: {
    fontSize: '24px',
    width: '24px',
    height: '24px',
  },
  large: {
    fontSize: '40px',
    width: '40px',
    height: '40px',
  },
});

export function ToolIcon({ toolId, size = 'medium' }: ToolIconProps) {
  const styles = useStyles();
  const Icon = ICONS[toolId];

  if (!Icon) {
    return null;
  }

  // Decorative: the tool name always sits next to it, so screen readers should not repeat it
  return <Icon className={mergeClasses(styles.icon, styles[size])} aria-hidden="true" />;
}

export function hasToolIcon(toolId: string): boolean {
  return toolId in ICONS;
}
