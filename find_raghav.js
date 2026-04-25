
const { Client } = require('pg');

async function findRaghav() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'cityhomes_hrms',
  });

  try {
    await client.connect();
    
    // Find Raghav
    const userRes = await client.query("SELECT id, name, basic_salary FROM users WHERE name ILIKE '%Raghav%';");
    console.log('User found:', userRes.rows);

    if (userRes.rows.length === 0) {
      console.log('No user named Raghav found.');
      return;
    }

    const raghav = userRes.rows[0];
    const employeeId = raghav.id;
    const startDate = '2026-03-16';
    const endDate = '2026-04-15';

    // Get Salary Settings for cycle
    const settingsRes = await client.query("SELECT * FROM settings WHERE key = 'salary_settings';");
    console.log('Salary Settings:', settingsRes.rows[0]);

    // Get detailed attendance for 16 Mar to 15 Apr
    const attendanceDetailsRes = await client.query(`
      SELECT date, status 
      FROM attendance 
      WHERE employee_id = $1 AND date BETWEEN $2 AND $3
      ORDER BY date;
    `, [employeeId, startDate, endDate]);
    console.log('Attendance Details:', attendanceDetailsRes.rows);

    // Get Approved Leaves
    const leavesRes = await client.query(`
      SELECT type, from_date, to_date 
      FROM leave_requests 
      WHERE employee_id = $1 AND status = 'approved' 
      AND (from_date <= $3 AND to_date >= $2);
    `, [employeeId, startDate, endDate]);
    console.log('Leaves:', leavesRes.rows);

    // Get Reimbursements
    const reimbRes = await client.query(`
      SELECT SUM(amount) as total 
      FROM reimbursements 
      WHERE employee_id = $1 AND status = 'approved' 
      AND date BETWEEN $2 AND $3;
    `, [employeeId, startDate, endDate]);
    console.log('Total Reimbursement:', reimbRes.rows[0].total);

    // Get Existing Payroll Record if any
    const payrollRes = await client.query(`
      SELECT * FROM payroll_runs 
      WHERE employee_id = $1 AND month = 4 AND year = 2026;
    `, [employeeId]);
    console.log('Existing Payroll:', payrollRes.rows[0]);

  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await client.end();
  }
}

findRaghav();
