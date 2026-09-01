import { Card, FluentProvider, Text, Title1, webLightTheme } from '@fluentui/react-components';
import rulesData from './data/rules.json';
import { loadRulesFile } from './engine/recommendationEngine';
import type { RulesFile } from './engine/types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WizardContainer } from './components/WizardContainer';

let rules: RulesFile | null = null;
let rulesError: string | null = null;

try {
  rules = loadRulesFile(rulesData as RulesFile);
} catch (error) {
  rulesError = error instanceof Error ? error.message : String(error);
}

export default function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      {rules ? (
        <ErrorBoundary>
          <WizardContainer rules={rules} />
        </ErrorBoundary>
      ) : (
        <main className="wizard-shell">
          <Card className="alert-card" role="alert">
            <Title1 as="h1">Unable to load framework data, please refresh</Title1>
            <Text>{rulesError}</Text>
          </Card>
        </main>
      )}
    </FluentProvider>
  );
}
