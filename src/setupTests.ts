// Jest setup file
global.fetch = jest.fn();

// Mock setTimeout and setInterval for testing
global.setTimeout = jest.fn((fn) => {
  return fn();
}) as any;

global.setInterval = jest.fn();
global.clearTimeout = jest.fn();
global.clearInterval = jest.fn();