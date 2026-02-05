/* eslint-disable no-undef */
/**
 * k6 Load Testing Script - Concurrent User Traffic
 *
 * Run with: k6 run tests/performance/load.js
 *
 * Simulates expected concurrent user traffic with ramping stages.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const taskLatency = new Trend('task_latency');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 }, // Ramp up to 20 users
        { duration: '1m', target: 20 }, // Stay at 20 users
        { duration: '30s', target: 50 }, // Ramp up to 50 users
        { duration: '1m', target: 50 }, // Stay at 50 users
        { duration: '30s', target: 0 }, // Ramp down to 0
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95th percentile < 1s
    errors: ['rate<0.05'], // Error rate < 5%
  },
};

export function setup() {
  const timestamp = Date.now();
  const email = `load_test_${timestamp}@example.com`;

  http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({ email, password: 'Password123!', name: 'Load Test User' }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email, password: 'Password123!' }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  const loginData = JSON.parse(loginRes.body);
  return { token: loginData.data?.token, email };
}

export default function (data) {
  if (!data.token) {
    errorRate.add(1);
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };

  // Mixed workload: 60% reads, 30% writes, 10% stats
  const rand = Math.random();

  if (rand < 0.6) {
    // Read tasks
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/tasks?limit=10`, { headers });
    taskLatency.add(Date.now() - start);
    errorRate.add(!check(res, { 'list tasks OK': (r) => r.status === 200 }));
  } else if (rand < 0.9) {
    // Create task
    const start = Date.now();
    const res = http.post(
      `${BASE_URL}/api/tasks`,
      JSON.stringify({ title: `Load test ${Date.now()}`, priority: 'low' }),
      { headers },
    );
    taskLatency.add(Date.now() - start);
    errorRate.add(!check(res, { 'create task OK': (r) => r.status === 201 }));
  } else {
    // Get stats
    const res = http.get(`${BASE_URL}/api/stats`, { headers });
    errorRate.add(!check(res, { 'stats OK': (r) => r.status === 200 }));
  }

  sleep(0.5 + Math.random());
}

export function teardown(data) {
  console.log(`Load test completed for: ${data.email}`);
}
