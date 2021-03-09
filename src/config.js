module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: 'postgres://ldftbmkldjmoex:334845eb05def47766d190b37a7aeca3449ca6d3697cbe7a5ec782f0b31d05ec@ec2-3-222-127-167.compute-1.amazonaws.com:5432/de9dhtjqa3e1dq' || 'postgresql://postgres@localhost/bnr-app',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://postgres@localhost/bnr-app-test',
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api",
    EMAIL_API_KEY: process.env.EMAIL_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET || 'bnr-super-secret-time'
  }