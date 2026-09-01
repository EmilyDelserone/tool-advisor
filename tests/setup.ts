import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// React Testing Library needs this flag to auto-wrap updates in act()
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  cleanup();
});
