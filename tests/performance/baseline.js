/* eslint-disable no-undef */
/**
 * k6 Performance Testing Script - Baseline Latency Tests
 *
 * Run with: k6 run tests/performance/baseline.js
 *
 * Prerequisites:
 * - Server must be running on http://localhost:3000
 * - A test user must exist (or will be created by setup)
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const taskLatency = new Trend('task_latency');

// Test configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Options for different test scenarios
export const options = {
  scenarios: {
    // Baseline test: constant low load
    baseline: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    errors: ['rate<0.1'], // Error rate should be below 10%
  },
};

// Setup function - runs once before all VUs
export function setup() {
  const timestamp = Date.now();
  const email = `perf_test_${timestamp}@example.com`;

  // Register a test user
  http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      email: email,
      password: 'Password123!',
      name: 'Performance Test User',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  // Login to get token
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: email,
      password: 'Password123!',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  const loginData = JSON.parse(loginRes.body);
  if (!loginData.data || !loginData.data.token) {
    console.error('Failed to get auth token:', loginRes.body);
    return { token: null };
  }

  return {
    token: loginData.data.token,
    email: email,
  };
}

// Main test function - runs for each VU
export default function (data) {
  if (!data.token) {
    console.error('No auth token available');
    errorRate.add(1);
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };

  // Test 1: Health check (unauthenticated)
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health check status is 200': (r) => r.status === 200,
  });

  // Test 2: Create a task
  const createStart = Date.now();
  const createRes = http.post(
    `${BASE_URL}/api/tasks`,
    JSON.stringify({
      title: `Performance test task ${Date.now()}`,
      priority: 'medium',
    }),
    { headers },
  );
  taskLatency.add(Date.now() - createStart);

  const createSuccess = check(createRes, {
    'create task status is 201': (r) => r.status === 201,
    'create task returns task data': (r) => {
      const body = JSON.parse(r.body);
      return body.success && body.data && body.data._id;
    },
  });
  errorRate.add(!createSuccess);

  let taskId = null;
  if (createSuccess) {
    const body = JSON.parse(createRes.body);
    taskId = body.data._id;
  }

  sleep(0.5);

  // Test 3: Get all tasks
  const listStart = Date.now();
  const listRes = http.get(`${BASE_URL}/api/tasks`, { headers });
  taskLatency.add(Date.now() - listStart);

  const listSuccess = check(listRes, {
    'list tasks status is 200': (r) => r.status === 200,
    'list tasks returns array': (r) => {
      const body = JSON.parse(r.body);
      return body.success && Array.isArray(body.data);
    },
  });
  errorRate.add(!listSuccess);

  sleep(0.5);

  // Test 4: Get stats
  const statsRes = http.get(`${BASE_URL}/api/stats`, { headers });
  check(statsRes, {
    'stats status is 200': (r) => r.status === 200,
  });

  // Test 5: Delete the task (cleanup)
  if (taskId) {
    const deleteRes = http.del(`${BASE_URL}/api/tasks/${taskId}`, null, { headers });
    check(deleteRes, {
      'delete task status is 204': (r) => r.status === 204,
    });
  }

  sleep(1);
}

// Teardown function - runs once after all VUs complete
export function teardown(data) {
  console.log(`Test completed for user: ${data.email}`);
}
