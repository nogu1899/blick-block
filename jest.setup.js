// Jest setup file for DOM environment
global.console = {
  ...console,
  // Suppress console.log during tests unless needed
  log: jest.fn(),
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};