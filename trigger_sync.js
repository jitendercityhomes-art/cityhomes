
const axios = require('axios');

async function triggerSync() {
  try {
    const response = await axios.post('http://localhost:3004/api/v1/payroll/sync', {
      month: 4,
      year: 2026
    });
    console.log('Sync response:', response.data);
  } catch (err) {
    console.error('Sync failed:', err.response?.data || err.message);
  }
}

triggerSync();
