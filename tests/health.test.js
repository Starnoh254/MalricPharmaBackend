const request = require('supertest');
const express = require('express');
const routes = require('../src/routes');

const app = express();
app.use('/api/v1', routes);

describe('Health Endpoint', () => {
    test('GET /api/v1/health should return healthy status', async () => {
        const response = await request(app)
            .get('/api/v1/health')
            .expect(200);

        expect(response.body).toHaveProperty('status', 'healthy');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('uptime');
        expect(response.body).toHaveProperty('environment');
        expect(response.body).toHaveProperty('version');

        // Verify timestamp is a valid ISO string
        expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);

        // Verify uptime is a number
        expect(typeof response.body.uptime).toBe('number');
        expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });

    test('Health endpoint should return JSON content type', async () => {
        const response = await request(app)
            .get('/api/v1/health')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body.status).toBe('healthy');
    });
});
