#!/usr/bin/env node

/**
 * Environment Setup Script
 * This script helps set up environment variables for different environments
 */

const fs = require('fs');
const path = require('path');

const environments = {
  development: {
    NEXT_PUBLIC_API_URL: 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: 'Admin Portal',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_APP_DESCRIPTION: 'Professional admin dashboard for managing your platform',
    NEXT_PUBLIC_APP_AUTHOR: 'Admin Team',
    NEXT_PUBLIC_API_TIMEOUT: '10000',
    NEXT_PUBLIC_API_RETRY_ATTEMPTS: '3',
    NEXT_PUBLIC_ENABLE_ANALYTICS: 'false',
    NEXT_PUBLIC_ENABLE_DEBUG: 'true',
    NEXT_PUBLIC_ENABLE_NOTIFICATIONS: 'true',
    NEXT_PUBLIC_ENABLE_DARK_MODE: 'true',
  },
  production: {
    NEXT_PUBLIC_API_URL: 'https://your-api-domain.com',
    NEXT_PUBLIC_APP_NAME: 'Admin Portal',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_APP_DESCRIPTION: 'Professional admin dashboard for managing your platform',
    NEXT_PUBLIC_APP_AUTHOR: 'Admin Team',
    NEXT_PUBLIC_API_TIMEOUT: '15000',
    NEXT_PUBLIC_API_RETRY_ATTEMPTS: '5',
    NEXT_PUBLIC_ENABLE_ANALYTICS: 'true',
    NEXT_PUBLIC_ENABLE_DEBUG: 'false',
    NEXT_PUBLIC_ENABLE_NOTIFICATIONS: 'true',
    NEXT_PUBLIC_ENABLE_DARK_MODE: 'true',
  },
  test: {
    NEXT_PUBLIC_API_URL: 'http://localhost:3001',
    NEXT_PUBLIC_APP_NAME: 'Admin Portal Test',
    NEXT_PUBLIC_APP_VERSION: '1.0.0-test',
    NEXT_PUBLIC_APP_DESCRIPTION: 'Test environment for admin portal',
    NEXT_PUBLIC_APP_AUTHOR: 'Admin Team',
    NEXT_PUBLIC_API_TIMEOUT: '5000',
    NEXT_PUBLIC_API_RETRY_ATTEMPTS: '1',
    NEXT_PUBLIC_ENABLE_ANALYTICS: 'false',
    NEXT_PUBLIC_ENABLE_DEBUG: 'true',
    NEXT_PUBLIC_ENABLE_NOTIFICATIONS: 'false',
    NEXT_PUBLIC_ENABLE_DARK_MODE: 'true',
  }
};

function createEnvFile(env, targetFile) {
  const envContent = Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const header = `# Environment variables for ${targetFile.includes('production') ? 'production' : targetFile.includes('test') ? 'test' : 'development'}\n# Generated on ${new Date().toISOString()}\n\n`;

  fs.writeFileSync(targetFile, header + envContent);
  console.log(`✅ Created ${targetFile}`);
}

function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'development';

  if (!environments[environment]) {
    console.error(`❌ Unknown environment: ${environment}`);
    console.log('Available environments: development, production, test');
    process.exit(1);
  }

  const rootDir = path.join(__dirname, '..');
  const envFile = environment === 'development' ? '.env.local' : `.env.${environment}`;
  const targetFile = path.join(rootDir, envFile);

  try {
    createEnvFile(environments[environment], targetFile);
    console.log(`🎉 Environment setup complete for ${environment}`);
    console.log(`📁 Environment file: ${envFile}`);
    
    if (environment === 'development') {
      console.log('\n📝 Next steps:');
      console.log('1. Review and update the generated .env.local file');
      console.log('2. Start the development server: npm run dev');
      console.log('3. Make sure your backend server is running on the configured API URL');
    }
  } catch (error) {
    console.error(`❌ Error creating environment file: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createEnvFile, environments };
