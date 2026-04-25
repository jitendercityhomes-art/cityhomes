
import React, { useState, useEffect } from 'react';
import HRLayout from '../../components/layouts/HRLayout';
import Icon from '../../components/shared/Icon';
import Av from '../../components/shared/Avatar';
import { THEME, DEFAULT_SALARY_SETTINGS, API_BASE } from '../../lib/constants';
import { calcSalary } from '../../lib/salary';
import { useAppContext } from '../../context/AppContext';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const HRPayroll = () => {
  const { globalStaff, salaryData, salarySettings } = useAppContext();
  const t = THEME.hr;
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editData, setEditData] = useState({});
  const [editingSalaryCycle, setEditingSalaryCycle] = useState(false);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [attendanceDataMap, setAttendanceDataMap] = useState({});
  const [syncing, setSyncing] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [salaryCycle, setSalaryCycle] = useState({
    cycleStart: 1,
    cycleEnd: 31,
    frequency: 'every month',
    payDate: 5,
    payDateType: 'of next month',
    period: '30 days fixed'
  });

  // Fetch payroll data when month/year changes
  useEffect(() => {
    fetchPayrollData();
  }, [selectedMonth, selectedYear]);

  const fetchPayrollData = async () => {
    try {
      const monthNumber = selectedMonth + 1;
      const year = selectedYear;
      const response = await fetch(
        `${API_BASE}/payroll?month=${monthNumber}&year=${year}`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        const existingPayroll = Array.isArray(data) ? data : [];
        
        // Fetch attendance data for all employees
        const attendanceMap = {};
        const hasPayrollIds = new Set(existingPayroll.map(p => Number(p.employee_id)));
        const placeholders = [];

        for (const staff of globalStaff) {
          if (staff.role === 'superadmin') continue;
          
          if (!hasPayrollIds.has(Number(staff.id))) {
            placeholders.push({
              employee_id: staff.id,
              employee: staff,
              placeholder: true,
              month: monthNumber,
              year: year,
              status: 'pending',
              gross_amount: 0,
              net_payable: 0,
              reimbursement_amount: 0
            });
          }

          try {
            const attendanceRes = await fetch(
              `${API_BASE}/attendance/employee/${staff.id}?month=${monthNumber}&year=${year}`,
              { credentials: 'include' }
            );
            if (attendanceRes.ok) {
              const attendanceData = await attendanceRes.json();
              const present = attendanceData.reduce((sum, rec) => sum + (rec.status === 'present' ? 1 : rec.status === 'half_day' ? 0.5 : 0), 0);
              const absent = attendanceData.reduce((sum, rec) => sum + (rec.status === 'absent' ? 1 : 0), 0);
              
              attendanceMap[staff.id] = {
                present: Math.round(present * 10) / 10,
                absent: absent,
              };
            }
          } catch (err) {
            console.error(`Failed to fetch attendance for employee ${staff.id}:`, err);
          }
        }
        
        setPayrollRecords([...existingPayroll, ...placeholders]);
        setAttendanceDataMap(attendanceMap);
        
        // Calculate total paid amount from payroll records
        const paidAmount = existingPayroll.reduce((sum, p) => {
          return sum + (p.status === 'paid' ? (p.net_payable || 0) : 0);
        }, 0);
        setTotalPaid(paidAmount);
      } else {
        // Backend error - show zeros
        setPayrollRecords([]);
        setAttendanceDataMap({});
        setTotalPaid(0);
      }
    } catch (error) {
      // Backend not running - show zeros
      console.error('Backend not available:', error);
      setPayrollRecords([]);
      setAttendanceDataMap({});
      setTotalPaid(0);
    }
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    for (let year = 2025; year <= currentYear; year++) {
      const startMonth = year === 2025 ? 0 : 0;
      const endMonth = year === currentYear ? currentMonth : 11;
      for (let month = startMonth; month <= endMonth; month++) {
        options.push({ month, year });
      }
    }
    return options;
  };

  const calculateTotalGross = () => {
    // If backend is down and no payroll records, show 0
    if (!payrollRecords || payrollRecords.length === 0) {
      return 0;
    }
    return payrollRecords.reduce((sum, p) => sum + (p.gross_amount || 0), 0);
  };

  const calculateTotalNetPayable = () => {
    // If backend is down and no payroll records, show 0
    if (!payrollRecords || payrollRecords.length === 0) {
      return 0;
    }
    return payrollRecords.reduce((sum, p) => sum + (p.net_payable || 0), 0);
  };

  const calculateTotalReimbursement = () => {
    // If backend is down and no payroll records, show 0
    if (!payrollRecords || payrollRecords.length === 0) {
      return 0;
    }
    return payrollRecords.reduce((sum, p) => sum + (p.reimbursement_amount || 0), 0);
  };

  const getPayrollForEmployee = (employeeId) => {
    return payrollRecords.find(p => p.employee_id === employeeId);
  };

  const handleProcessAll = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/payroll/sync`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth + 1, year: selectedYear }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || 'Payroll sync failed');
      }

      const data = await res.json();
      setPayrollRecords(Array.isArray(data) ? data : []);
      const paidAmount = (Array.isArray(data) ? data : []).reduce((sum, p) => sum + (p.status === 'paid' ? (p.net_payable || 0) : 0), 0);
      setTotalPaid(paidAmount);
    } catch (err) {
      console.error('Process All failed', err);
    } finally {
      setSyncing(false);
    }
  };

  const openEditModal = (emp) => {
    const sd = (salaryData || {})[emp.id] || { basic: 0, hra: 0, da: 0, bonus: 0, overtime: 0, incentive: 0, presentDays: 0 };
    setEditingEmployee(emp);
    setEditData({ ...sd });
  };

  const closeEditModal = () => {
    setEditingEmployee(null);
    setEditData({});
  };

  return (
    <HRLayout title="Staff Payroll">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 18, paddingTop: 18, marginLeft: 6 }}>
        <div>
          <div className="pt" style={{ marginBottom: 0 }}>Payroll</div>
          <div className="ps">Salary processing · attendance-based calculation</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--br)', borderRadius: 10, padding: '8px 12px', background: '#fff', height: 36, minWidth: 130 }}>
            <Icon n="calendar" size={14} color="var(--t2)" />
            <select value={`${selectedMonth}-${selectedYear}`} onChange={e => {
              const [m, y] = e.target.value.split('-');
              setSelectedMonth(parseInt(m));
              setSelectedYear(parseInt(y));
            }} style={{ border: 'none', background: 'transparent', outline: 'none', minWidth: 110, width: '100%', color: '#0f172a', fontSize: 13, fontWeight: 600, cursor: 'pointer', height: '100%', appearance: 'none' }}>
              {generateMonthOptions().map(({month, year}) => (
                <option key={`${month}-${year}`} value={`${month}-${year}`}>{MONTH_NAMES[month]} {year}</option>
              ))}
            </select>
          </div>
          <button className="btn bs" style={{ padding: '8px 12px', borderRadius: 10, height: 36 }}>
            <Icon n="settings" size={14} /> Salary Settings
          </button>
          <button className="btn" style={{ padding: '8px 12px', borderRadius: 10, background: '#10b981', color: '#fff', height: 36 }} disabled={syncing} onClick={handleProcessAll}>
            <Icon n="check" size={14} /> {syncing ? 'Processing…' : 'Process All'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 24, marginLeft: 6 }}>
        <div style={{ padding: '16px 20px', borderRadius: 16, border: '1px solid var(--br)', background: 'var(--s1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>💰 Total Gross</div>
            <div style={{ width: 34, height: 34, borderRadius: 12, background: 'rgba(15, 118, 110, 0.12)', display: 'grid', placeItems: 'center' }}><Icon n="currency" size={16} color="#0f766e" /></div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--t1)' }}>₹{calculateTotalGross().toLocaleString()}</div>
        </div>
        <div style={{ padding: '16px 20px', borderRadius: 16, border: '1px solid var(--br)', background: 'var(--s1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>✓ Net Payable</div>
            <div style={{ width: 34, height: 34, borderRadius: 12, background: 'rgba(5, 150, 105, 0.12)', display: 'grid', placeItems: 'center' }}><Icon n="check" size={16} color="#059669" /></div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981' }}>₹{calculateTotalNetPayable().toLocaleString()}</div>
        </div>
        <div style={{ padding: '16px 20px', borderRadius: 16, border: '1px solid var(--br)', background: 'var(--s1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>🏦 Paid</div>
            <div style={{ width: 34, height: 34, borderRadius: 12, background: 'rgba(37, 99, 235, 0.12)', display: 'grid', placeItems: 'center' }}><Icon n="bank" size={16} color="#2563EB" /></div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--t1)' }}>₹{totalPaid.toLocaleString()}</div>
        </div>
        <div style={{ padding: '16px 20px', borderRadius: 16, border: '1px solid var(--br)', background: 'var(--s1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>📋 Reimb. Added</div>
            <div style={{ width: 34, height: 34, borderRadius: 12, background: 'rgba(14, 165, 233, 0.12)', display: 'grid', placeItems: 'center' }}><Icon n="receipt" size={16} color="#0ea5e9" /></div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--t1)' }}>₹{calculateTotalReimbursement().toLocaleString()}</div>
        </div>
      </div>

      {/* Info Bar */}
      <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: 16, fontSize: 12, color: 'var(--t2)', display: 'flex', gap: 16, alignItems: 'center' }}>
        <Icon n="info" size={14} style={{ opacity: 0.6, marginRight: 4 }} />
        <span><strong>Salary Cycle:</strong> {salaryCycle.cycleStart}-{salaryCycle.cycleEnd} {salaryCycle.frequency}</span>
        <span>•</span>
        <span><strong>Pay Date:</strong> {salaryCycle.payDate} {salaryCycle.payDateType}</span>
        <span>•</span>
        <span><strong>Period:</strong> {salaryCycle.period}</span>
        <div style={{ marginLeft: 'auto', cursor: 'pointer', color: '#3b82f6', fontWeight: 600 }} onClick={() => setEditingSalaryCycle(true)}>✎ Edit</div>
      </div>

      {/* Payroll Table */}
      <div className="cd" style={{ marginLeft: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--br)' }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>Staff Payroll — {MONTH_NAMES[selectedMonth]} {selectedYear}</div>
          <button className="btn bs btn-sm" style={{ fontSize: 11 }}>Export</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>BASIC</th>
              <th>PRESENT/WORKING</th>
              <th>LOP DEDUCTED</th>
              <th>REIMB. ADDED</th>
              <th>NET PAYABLE</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {payrollRecords.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--t3)', fontSize: 14 }}>
                  No payroll data available for {MONTH_NAMES[selectedMonth]} {selectedYear}. {payrollRecords === null ? 'Backend may be offline.' : 'Process payroll first.'}
                </td>
              </tr>
            ) : (
              payrollRecords.map(pr => {
                const employee = pr.employee || { name: 'Unknown', designation: 'Employee' };
                const netPayable = pr.net_payable || 0;
                const presentDays = pr.present_days || 0;
                const lopDays = pr.lop_days || 0;
                const reimbursement = pr.reimbursement_amount || 0;
                const status = pr.status || 'pending';

                return (
                  <tr key={pr.id}>
                    <td>
                      <div className="av-row">
                        <Av name={employee.name} size={26} r={7} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 12 }}>{employee.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--t3)' }}>{employee.designation || 'Employee'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 600 }}>₹{(pr.basic_earned || 0).toLocaleString()}</td>
                    <td style={{ fontSize: 12 }}>
                      <span style={{ fontWeight: 700 }}>{presentDays}</span>
                      <span style={{ color: 'var(--t3)', fontSize: 10, marginLeft: 4 }}>out of 26d</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--t3)' }}>-₹{lopDays.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td style={{ fontSize: 12 }}>₹{reimbursement.toLocaleString()}</td>
                    <td style={{ fontWeight: 800, fontSize: 12 }}>₹{netPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td>
                      <span className={`bg bg-${status === 'paid' ? 'paid' : 'pend'}`} style={{ fontSize: 9, padding: '4px 12px', borderRadius: 6, textTransform: 'capitalize' }}>{status}</span>
                    </td>
                    <td>
                      <button className="ib" onClick={() => openEditModal(employee)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--br)', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>
                        <Icon n="edit" size={12} /> Edit
                      </button>
                      <button className="ib pay" style={{ padding: '6px 12px', background: '#fff', border: '1px solid var(--br)', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginLeft: 8, color: '#10b981' }}>
                        Pay
                      </button>
                      <button className="ib" style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--br)', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginLeft: 8 }}>
                        Slip
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingEmployee && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 600, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Edit Salary Components for {editingEmployee.name}</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Basic Salary</label>
                <input type="number" value={editData.basic || 0} onChange={e => setEditData({ ...editData, basic: parseFloat(e.target.value) })} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: 8, fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>HRA</label>
                <input type="number" value={editData.hra || 0} onChange={e => setEditData({ ...editData, hra: parseFloat(e.target.value) })} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: 8, fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>DA</label>
                <input type="number" value={editData.da || 0} onChange={e => setEditData({ ...editData, da: parseFloat(e.target.value) })} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: 8, fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Bonus</label>
                <input type="number" value={editData.bonus || 0} onChange={e => setEditData({ ...editData, bonus: parseFloat(e.target.value) })} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: 8, fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Overtime</label>
                <input type="number" value={editData.overtime || 0} onChange={e => setEditData({ ...editData, overtime: parseFloat(e.target.value) })} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: 8, fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Incentive</label>
                <input type="number" value={editData.incentive || 0} onChange={e => setEditData({ ...editData, incentive: parseFloat(e.target.value) })} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: 8, fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Present Days</label>
                <input type="number" value={editData.presentDays || 0} onChange={e => setEditData({ ...editData, presentDays: parseInt(e.target.value) })} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: 8, fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Month</label>
                <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: 8, fontSize: 12 }}>
                  {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 12, background: 'var(--s2)', marginBottom: 24, fontSize: 12, color: 'var(--t2)' }}>
              <strong>Preview:</strong> ₹{editData.basic || 0} x 3d × (15 + 5 + 2h) = ₹{editData.basic || 0} + Reimb ₹0 = ₹{editData.basic || 0}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={closeEditModal} style={{ padding: '12px 24px', border: '1px solid var(--br)', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={closeEditModal} style={{ padding: '12px 24px', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>✓ Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Salary Cycle Edit Modal */}
      {editingSalaryCycle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 600, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Edit Salary Cycle Settings</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Cycle Start Day</label>
                <input type="number" value={salaryCycle.cycleStart} onChange={e => setSalaryCycle({ ...salaryCycle, cycleStart: parseInt(e.target.value) })} min="1" max="31" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: 8, fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Cycle End Day</label>
                <input type="number" value={salaryCycle.cycleEnd} onChange={e => setSalaryCycle({ ...salaryCycle, cycleEnd: parseInt(e.target.value) })} min="0" max="31" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: 8, fontSize: 12 }} />
                <div style={{ fontSize: 9, color: 'var(--t3)', marginTop: 4 }}>Set 0 for Month End</div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Pay Date (Day)</label>
                <input type="number" value={salaryCycle.payDate} onChange={e => setSalaryCycle({ ...salaryCycle, payDate: parseInt(e.target.value) })} min="1" max="31" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: 8, fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Pay Date Type</label>
                <select value={salaryCycle.payDateType} onChange={e => setSalaryCycle({ ...salaryCycle, payDateType: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: 8, fontSize: 12 }}>
                  <option value="of next month">of next month</option>
                  <option value="of same month">of same month</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Frequency</label>
                <select value={salaryCycle.frequency} onChange={e => setSalaryCycle({ ...salaryCycle, frequency: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: 8, fontSize: 12 }}>
                  <option value="every month">every month</option>
                  <option value="twice a month">twice a month</option>
                  <option value="weekly">weekly</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Period</label>
                <input type="text" value={salaryCycle.period} onChange={e => setSalaryCycle({ ...salaryCycle, period: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--br)', borderRadius: 8, fontSize: 12 }} />
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 12, background: 'var(--s2)', marginBottom: 24, fontSize: 12, color: 'var(--t2)' }}>
              <strong>Preview:</strong> Salary Cycle {salaryCycle.cycleStart}-{salaryCycle.cycleEnd} {salaryCycle.frequency} • Pay Date: {salaryCycle.payDate} {salaryCycle.payDateType} • Period: {salaryCycle.period}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingSalaryCycle(false)} style={{ padding: '12px 24px', border: '1px solid var(--br)', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={() => setEditingSalaryCycle(false)} style={{ padding: '12px 24px', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>✓ Save</button>
            </div>
          </div>
        </div>
      )}
    </HRLayout>
  );
};

export default HRPayroll;
