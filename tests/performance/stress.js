/* eslint-disable no-undef */
/**
 * k6 Stress Testing Script - System Breaking Point
 *
 * Run with: k6 run tests/performance/stress.js
 *
 * Determines system capacity by gradually increasing load until failure.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const requestLatency = new Trend('request_latency');
const requestCount = new Counter('requests');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 }, // Warm up
        { duration: '30s', target: 100 }, // Increase
        { duration: '30s', target: 150 }, // Push harder
        { duration: '30s', target: 200 }, // Stress point
        { duration: '30s', target: 250 }, // Breaking point attempt
        { duration: '30s', target: 0 }, // Recovery
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(99)<3000'], // 99th percentile < 3s (relaxed for stress)
    errors: ['rate<0.3'], // Allow up to 30% errors during stress
  },
};

export function setup() {
  const timestamp = Date.now();
  const email = `stress_test_${timestamp}@example.com`;

  http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({ email, password: 'Password123!', name: 'Stress Test User' }),
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

  requestCount.add(1);

  // High-intensity mixed workload
  const start = Date.now();
  const res = http.get(`${BASE_URL}/api/tasks?limit=5`, { headers });
  requestLatency.add(Date.now() - start);

  const success = check(res, {
    'response status OK': (r) => r.status >= 200 && r.status < 400,
  });
  errorRate.add(!success);

  // Minimal sleep to maximize pressure
  sleep(0.1);
}

export function teardown(data) {
  console.log(`Stress test completed for: ${data.email}`);
}
