const { EventEmitter } = require('events');

// Increase max listeners to prevent warnings during testing
EventEmitter.defaultMaxListeners = 20;

// Global test setup
beforeAll(async () => {
  // Mock external APIs for testing
  jest.mock('axios', () => ({
    create: jest.fn(() => ({
      get: jest.fn(() => Promise.resolve({ data: {} })),
      post: jest.fn(() => Promise.resolve({ data: {} })),
      put: jest.fn(() => Promise.resolve({ data: {} })),
      delete: jest.fn(() => Promise.resolve({ data: {} })),
      patch: jest.fn(() => Promise.resolve({ data: {} })),
    })),
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),
  }));
  
  // Mock NestJS EventEmitter
  jest.mock('@nestjs/event-emitter', () => ({
    EventEmitter2: jest.fn().mockImplementation(() => ({
      emit: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      removeListener: jest.fn(),
    })),
    OnEvent: () => () => {},
  }));
  
  // Mock NestJS Schedule
  jest.mock('@nestjs/schedule', () => ({
    Cron: () => () => {},
    CronExpression: {
      EVERY_10_MINUTES: '*/10 * * * *',
      EVERY_DAY_AT_MIDNIGHT: '0 0 * * *',
    },
  }));
  
  // Mock bcrypt for consistent testing
  jest.mock('bcrypt', () => ({
    hash: jest.fn((password, rounds) => Promise.resolve(`hashed_${password}`)),
    compare: jest.fn((password, hash) => Promise.resolve(hash === `hashed_${password}`)),
  }));
  
  console.log('🧪 Jest global setup completed');
});

// Global test cleanup
afterAll(async () => {
  // Clear all mocks after tests
  jest.clearAllMocks();
  
  // Close any open handles
  if (global.gc) {
    global.gc();
  }
  
  console.log('🧹 Jest global cleanup completed');
});

// Global test timeout
jest.setTimeout(30000);

// Suppress console.log in tests unless explicitly needed
if (process.env.NODE_ENV === 'test' && !process.env.JEST_VERBOSE) {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}