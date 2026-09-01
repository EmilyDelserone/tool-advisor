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
  if (!rules) {
    return (
      <main className="wizard-shell">
        <div className="wizard-card" role="alert">
          <h1 className="wizard-title">Unable to load framework data, please refresh</h1>
          <p>{rulesError}</p>
        </div>
      </main>
    );
  }

  return (
    <ErrorBoundary>
      <WizardContainer rules={rules} />
    </ErrorBoundary>
  );
}
