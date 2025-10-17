import request from 'supertest';
import app from '../app.js';

async function main() {
  try {
    const res = await request(app).get('/api/health');
    if (res.status !== 200 || res.text !== 'OK') {
      console.error('Smoke failed: unexpected health response', res.status, res.text);
      process.exit(1);
    }
    console.log('Smoke OK');
  } catch (err) {
    console.error('Smoke error:', err);
    process.exit(1);
  }
}

main();
