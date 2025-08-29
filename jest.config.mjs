// jest.config.mjs
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // --- THIS IS THE PERMANENT FIX ---
  moduleNameMapper: {
    // Handle module aliases (this is the existing one)
    '^@/(.*)$': '<rootDir>/$1',
    
    // Force Jest to use our mock file for the Spline component
    '^@splinetool/react-spline/next$': '<rootDir>/__mocks__/componentMock.tsx',
  },
}

export default createJestConfig(config)