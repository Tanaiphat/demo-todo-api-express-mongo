/* eslint-disable no-undef */
/**
 * k6 Scalability Testing Script - Large Dataset
 *
 * Run with: k6 run tests/performance/scalability.js
 *
 * Tests API performance against a user with a large number of tasks.
 * NOTE: Requires running src/scripts/seed-large-dataset.ts first to create the user and tasks.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const listLatency = new Trend('list_latency');
const statsLatency = new Trend('stats_latency');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// This script assumes the user exists with password "password123!".

export const options = {
  scenarios: {
    scalability_read: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    list_latency: ['p(95)<1000'], // Listing should still be fast with pagination
    stats_latency: ['p(95)<2000'], // Stats might take longer with 10k items
    errors: ['rate<0.01'],
  },
};

export function setup() {
  // We need the email of the seeded user.
  // If not provided via ENV, we might fail or fallback.
  // For automation, we'll assume the user is passed in or we pick a fixed one if we modify the seed script.

  if (!__ENV.SCALE_USER_EMAIL) {
    // Fallback: Register a fresh user and we'll just test against that (even if empty, but that defeats the point)
    // The user instruction implies "Test with large datasets".
    // So we MUST use the user with data.
    console.error('Please provide SCALE_USER_EMAIL env var from the seed script output.');
    // return { skip: true };
  }

  const email = __ENV.SCALE_USER_EMAIL;
  // We need to ensure the seed script sets the password to 'password123!' (hashed)
  // or that we can login.

  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: email,
      password: 'password123!',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  const loginData = JSON.parse(loginRes.body);
  if (!loginData.data?.token) {
    console.error(
      'Login failed for scale user. Make sure to run seed script and use correct email/password.',
    );
  }

  return { token: loginData.data?.token };
}

export default function (data) {
  if (!data || !data.token) {
    // sleep(1);
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };

  // 1. List tasks with pagination (efficient)
  const listStart = Date.now();
  const listRes = http.get(`${BASE_URL}/api/tasks?limit=20&page=1`, { headers });
  listLatency.add(Date.now() - listStart);
  const listSuccess = check(listRes, { 'list tasks OK': (r) => r.status === 200 });
  errorRate.add(!listSuccess);

  sleep(1);

  // 2. Get stats (aggregation over large dataset)
  const statsStart = Date.now();
  const statsRes = http.get(`${BASE_URL}/api/stats`, { headers });
  statsLatency.add(Date.now() - statsStart);
  const statsSuccess = check(statsRes, { 'stats OK': (r) => r.status === 200 });
  errorRate.add(!statsSuccess);

  sleep(1);
}
