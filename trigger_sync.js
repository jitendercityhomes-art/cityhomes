
const axios = require('axios');
const API_BASE = 'http://localhost:3004/api/v1';

async function triggerSync() {
  try {
    const response = await axios.post(`${API_BASE}/payroll/sync`, {
      month: 4,
      year: 2026
    });
    console.log('Sync response:', response.data);
  } catch (err) {
    console.error('Sync failed:', err.response?.data || err.message);
  }
}

triggerSync();
