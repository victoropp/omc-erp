const { MongoMemoryServer } = require('mongodb-memory-server');
const { createConnection } = require('typeorm');

let mongoServer;
let testConnection;

module.exports = async () => {
  // Start in-memory MongoDB for testing
  mongoServer = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'test_omc_erp',
    },
  });
  
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  
  console.log('🚀 Test MongoDB started at:', mongoUri);
  
  // Set up test database connection
  try {
    testConnection = await createConnection({
      type: 'postgres',
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT) || 5433,
      username: process.env.TEST_DB_USER || 'test_user',
      password: process.env.TEST_DB_PASSWORD || 'test_password',
      database: process.env.TEST_DB_NAME || 'test_omc_erp',
      synchronize: true,
      logging: false,
      entities: ['packages/database/src/entities/**/*.ts'],
      migrations: ['packages/database/migrations/**/*.sql'],
    });
    
    console.log('🎯 Test PostgreSQL connection established');
    
    // Run migrations for test database
    await testConnection.runMigrations();
    console.log('📦 Test database migrations completed');
    
  } catch (error) {
    console.warn('⚠️  PostgreSQL not available for testing, using SQLite fallback');
    
    // Fallback to SQLite for local testing
    testConnection = await createConnection({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      logging: false,
      entities: ['packages/database/src/entities/**/*.ts'],
    });
  }
  
  // Store connections globally for test access
  global.__MONGO_SERVER__ = mongoServer;
  global.__TEST_CONNECTION__ = testConnection;
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = 'test_jwt_access_secret';
  process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret';
  process.env.CONFIG_ENCRYPTION_KEY = 'test_encryption_key_32_chars_min';
  
  console.log('✅ Global test setup completed');
};