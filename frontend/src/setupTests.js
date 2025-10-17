// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Mock TextEncoder/TextDecoder
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Comprehensive Ant Design mock

jest.mock('@ant-design/icons', () => ({
  CheckCircleFilled: () => <span data-testid="mock-icon-check-circle-filled" />,
  HomeOutlined: () => <span data-testid="mock-icon-home-outlined" />,
  ClockCircleOutlined: () => <span data-testid="mock-icon-clock-circle-outlined" />,
  CreditCardOutlined: () => <span data-testid="mock-icon-credit-card-outlined" />,
  UserOutlined: () => <span data-testid="mock-icon-user-outlined" />,
  LeftOutlined: () => <span data-testid="mock-icon-left-outlined" />,
  BellOutlined: () => <span data-testid="mock-icon-bell-outlined" />,
}));
