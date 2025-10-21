// Test file to verify API configuration
import { api, config } from './api';

console.log('API Configuration Test:');
console.log('======================');

console.log('API Base URL:', config.BASE_URL);
console.log('API Timeout:', config.TIMEOUT);

console.log('\nAPI Endpoints:');
console.log('Admin Login:', api.admin.login);
console.log('Admin Signup:', api.admin.signup);
console.log('Admin Delete:', api.admin.delete);

console.log('\nUsers Endpoints:');
console.log('Users List:', api.users.LIST);
console.log('Users Create:', api.users.CREATE);

console.log('\nAnalytics Endpoints:');
console.log('Analytics Dashboard:', api.analytics.DASHBOARD);

export { api, config };
