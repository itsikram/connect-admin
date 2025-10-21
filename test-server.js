const fetch = require('node-fetch');

async function testServer() {
    try {
        console.log('Testing server at http://localhost:4000/api/admin/signup');
        
        const response = await fetch('http://localhost:4000/api/admin/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullName: 'Test User',
                email: 'test@example.com',
                password: 'Test123456',
                role: 'admin'
            })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('JSON Response:', JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.log('Non-JSON Response:', text);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testServer();
