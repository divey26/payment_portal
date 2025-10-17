// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for libraries that need them (e.g., jspdf deps)
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  // jsdom may already have TextDecoder, but set if missing
  if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder;
  }
}

// Polyfill matchMedia for Ant Design responsive hooks
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => {
      const mql = {
        matches: false,
        media: query,
        onchange: null,
        addListener: (cb) => cb({ matches: false }),
        removeListener: () => {},
        addEventListener: (_evt, cb) => cb({ matches: false }),
        removeEventListener: () => {},
        dispatchEvent: () => false,
      };
      return mql;
    }),
  });
}

// Mock heavy PDF libs globally to avoid Node/Canvas issues in tests
jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    setFillColor: jest.fn(),
    roundedRect: jest.fn(),
    setFont: jest.fn(),
    setTextColor: jest.fn(),
    setFontSize: jest.fn(),
    text: jest.fn(),
    getTextWidth: () => 30,
    setDrawColor: jest.fn(),
    setLineWidth: jest.fn(),
    internal: { pageSize: { getWidth: () => 420 } },
    lastAutoTable: { finalY: 200 },
    save: jest.fn(),
  })),
}));

jest.mock('jspdf-autotable', () => ({ __esModule: true, default: jest.fn() }));

// Mock AntD responsive observer (it is a function that returns an object)
jest.mock('antd/lib/_util/responsiveObserver', () => {
  const responsiveArray = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const matchScreen = (screens, sizes) => {
    if (!sizes) return undefined;
    for (const bp of responsiveArray) {
      if (screens?.[bp] && Object.prototype.hasOwnProperty.call(sizes, bp)) {
        return sizes[bp];
      }
    }
    return undefined;
  };
  return {
    __esModule: true,
    default: () => ({
      responsiveMap: {},
      subscribe: (cb) => {
        cb({});
        return 1;
      },
      unsubscribe: () => {},
    }),
    responsiveArray,
    matchScreen,
  };
});

// Suppress noisy warnings/errors in tests for expected library messages
const originalWarn = console.warn.bind(console);
const originalError = console.error.bind(console);
const SUPPRESSED = [
  /React Router Future Flag Warning/i,
  /\[antd: .*?\] `.*` is deprecated/i,
  /\[antd: compatible\]/i,
  /There may be circular references/i,
  /not wrapped in act\(\)/i,
  /does not recognize the `.*` prop/i,
  /inside a test was not wrapped in act/i,
  /An update to .* was not wrapped in act/i,
  /Server unavailable:/i,
];

console.warn = (...args) => {
  const msg = args[0] && String(args[0]);
  if (msg && SUPPRESSED.some((re) => re.test(msg))) return;
  originalWarn(...args);
};

console.error = (...args) => {
  const msg = args[0] && String(args[0]);
  if (msg && SUPPRESSED.some((re) => re.test(msg))) return;
  originalError(...args);
};
