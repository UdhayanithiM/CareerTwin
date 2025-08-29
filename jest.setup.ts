// jest.setup.ts

import '@testing-library/jest-dom'

// Mock IntersectionObserver for Framer Motion
const IntersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = jest.fn().mockImplementation(IntersectionObserverMock);

// --- THIS IS THE FIX ---
// Mock ResizeObserver for Radix UI components
const ResizeObserverMock = () => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.ResizeObserver = jest.fn().mockImplementation(ResizeObserverMock);