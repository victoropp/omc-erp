module.exports = async () => {
  // Close MongoDB server
  if (global.__MONGO_SERVER__) {
    await global.__MONGO_SERVER__.stop();
    console.log('🛑 Test MongoDB stopped');
  }
  
  // Close test database connection
  if (global.__TEST_CONNECTION__) {
    await global.__TEST_CONNECTION__.close();
    console.log('🔌 Test database connection closed');
  }
  
  console.log('🧹 Global test teardown completed');
};