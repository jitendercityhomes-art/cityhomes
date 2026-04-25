import React, { useState, useEffect } from 'react';
import Icon from '../shared/Icon';
import { API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const SalaryDetails = ({ emp, onBack, accentColor, flat = false, showClose = true }) => {
  const { user: currentUser } = useAppContext();
  const employee = emp || {};
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [salaryData, setSalaryData] = useState({
    basic_salary: 0,
    hra: 0,
    da: 0,
    medical_allowance: 0,
    special_allowance: 0,
    incentive: 0,
    pf_employee: 0,
    pf_employer: 0,
    esi: 0,
    professional_tax: 0,
    tds: 0,
    other_deductions: 0
  });
  const [presentDays, setPresentDays] = useState(0);

  const t = accentColor || 'var(--teal)';
  const canEdit = currentUser?.role === 'superadmin' || currentUser?.role === 'hr';

  useEffect(() => {
    const loadSalaryData = async () => {
      if (!employee?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch salary data
        const res = await fetch(`${API_BASE}/salary/${employee.id}`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setSalaryData({
            basic_salary: data.basic || data.basic_salary || 0,
            hra: data.hra || 0,
            da: data.da || 0,
            medical_allowance: data.medical_allowance || 0,
            special_allowance: data.special_allowance || 0,
            incentive: data.incentive || 0,
            pf_employee: data.pf_deduction || 0,
            pf_employer: data.pf_employer || 0,
            esi: data.esi_deduction || 0,
            professional_tax: data.professional_tax || 0,
            tds: data.tds_deduction || 0,
            other_deductions: data.other_deductions || 0
          });
        }
      } catch (err) {
        console.error('Failed to load salary data', err);
      }

      // Fetch attendance data for present days (selected month)
      try {
        const attendanceRes = await fetch(`${API_BASE}/attendance/employee/${employee.id}?month=${selectedMonth + 1}&year=${selectedYear}`, {
          credentials: 'include'
        });
        if (attendanceRes.ok) {
          const attendanceData = await attendanceRes.json();
          const presentCount = (attendanceData.days || []).filter(d => d.status === 'present').length;
          setPresentDays(presentCount);
        }
      } catch (err) {
        console.error('Failed to load attendance data', err);
      }

      setLoading(false);
    };

    loadSalaryData();
  }, [employee.id, selectedMonth, selectedYear]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/salary/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(salaryData)
      });

      if (res.ok) {
        setIsEditing(false);
      } else {
        alert('Failed to save salary details');
      }
    } catch (err) {
      console.error('Error saving salary details', err);
      alert('Error saving salary details');
    } finally {
      setSaving(false);
    }
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const calculateGross = () => {
    return (
      Number(salaryData.basic_salary) +
      Number(salaryData.hra) +
      Number(salaryData.da) +
      Number(salaryData.medical_allowance) +
      Number(salaryData.special_allowance) +
      Number(salaryData.incentive)
    );
  };

  const calculateDeductions = () => {
    return (
      Number(salaryData.pf_employee) +
      Number(salaryData.esi) +
      Number(salaryData.professional_tax) +
      Number(salaryData.tds) +
      Number(salaryData.other_deductions)
    );
  };

  const calculateNet = () => calculateGross() - calculateDeductions();

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--t2)' }}>Loading Salary Details...</div>;

  return (
    <div className={flat ? '' : 'cd'} style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Salary Configuration</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {canEdit && !isEditing && (
            <button className="btn bs" onClick={() => setIsEditing(true)} style={{ padding: '8px 16px', borderRadius: 10 }}>
              <Icon n="edit" size={14} /> Edit Structure
            </button>
          )}
          {showClose && (
            <button className="ib" onClick={onBack} style={{ background: 'var(--s2)', borderRadius: 10 }}><Icon n="x" size={16} color="var(--t2)"/></button>
          )}
        </div>
      </div>

      {/* Month/Year Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '12px 16px', borderRadius: 12, background: 'var(--s2)' }}>
        <button onClick={handlePrevMonth} className="ib" style={{ padding: '8px 8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <Icon n="chevron-left" size={18} color="var(--t2)" />
        </button>
        <div style={{ textAlign: 'center', minWidth: 180, fontSize: 16, fontWeight: 700, color: 'var(--t1)' }}>
          {MONTH_NAMES[selectedMonth]} {selectedYear}
        </div>
        <button onClick={handleNextMonth} className="ib" style={{ padding: '8px 8px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <Icon n="chevron-right" size={18} color="var(--t2)" />
        </button>
      </div>

      {/* Present Days Display */}
      <div style={{ padding: '16px 18px', borderRadius: 18, border: '1px solid var(--br)', background: 'rgba(37, 99, 235, 0.08)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#2563EB' }}>{presentDays}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase' }}>Present Days</div>
          <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>{MONTH_NAMES[selectedMonth]} {selectedYear}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
        {/* Earnings */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--br)', paddingBottom: 8, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <span>Earnings (Monthly)</span>
            <span style={{ color: '#10b981' }}>{formatCurrency(calculateGross())}</span>
          </div>
          
          <div style={{ display: 'grid', gap: 12 }}>
            <SalaryField label="Basic Salary" value={salaryData.basic_salary} editing={isEditing} onChange={v => setSalaryData({ ...salaryData, basic_salary: v })} />
            <SalaryField label="HRA" value={salaryData.hra} editing={isEditing} onChange={v => setSalaryData({ ...salaryData, hra: v })} />
            <SalaryField label="DA" value={salaryData.da} editing={isEditing} onChange={v => setSalaryData({ ...salaryData, da: v })} />
            <SalaryField label="Medical Allowance" value={salaryData.medical_allowance} editing={isEditing} onChange={v => setSalaryData({ ...salaryData, medical_allowance: v })} />
            <SalaryField label="Special Allowance" value={salaryData.special_allowance} editing={isEditing} onChange={v => setSalaryData({ ...salaryData, special_allowance: v })} />
            <SalaryField label="Incentive" value={salaryData.incentive} editing={isEditing} onChange={v => setSalaryData({ ...salaryData, incentive: v })} />
          </div>
        </div>

        {/* Deductions */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--br)', paddingBottom: 8, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <span>Deductions</span>
            <span style={{ color: '#ef4444' }}>{formatCurrency(calculateDeductions())}</span>
          </div>
          
          <div style={{ display: 'grid', gap: 12 }}>
            <SalaryField label="PF (Employee Contribution)" value={salaryData.pf_employee} editing={isEditing} onChange={v => setSalaryData({ ...salaryData, pf_employee: v })} />
            <SalaryField label="ESI" value={salaryData.esi} editing={isEditing} onChange={v => setSalaryData({ ...salaryData, esi: v })} />
            <SalaryField label="Professional Tax" value={salaryData.professional_tax} editing={isEditing} onChange={v => setSalaryData({ ...salaryData, professional_tax: v })} />
            <SalaryField label="TDS / Income Tax" value={salaryData.tds} editing={isEditing} onChange={v => setSalaryData({ ...salaryData, tds: v })} />
            <SalaryField label="Other Deductions" value={salaryData.other_deductions} editing={isEditing} onChange={v => setSalaryData({ ...salaryData, other_deductions: v })} />
          </div>

          <div style={{ marginTop: 32, padding: 20, borderRadius: 20, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' }}>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>Take Home Salary</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{formatCurrency(calculateNet())}</div>
            <div style={{ fontSize: 11, marginTop: 8, opacity: 0.9 }}>Estimated monthly net payout</div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn bs" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</button>
          <button className="btn" onClick={handleSave} style={{ background: accentColor || 'var(--teal)', color: '#fff', minWidth: 120 }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Structure'}
          </button>
        </div>
      )}
    </div>
  );
};

const SalaryField = ({ label, value, editing, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--s2)' }}>
    <span style={{ fontSize: 13, color: 'var(--t2)', fontWeight: 600 }}>{label}</span>
    {editing ? (
      <input 
        type="number"
        className="f-in" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        style={{ width: 120, textAlign: 'right', borderRadius: 10, padding: '6px 12px', fontSize: 13, fontWeight: 800 }}
      />
    ) : (
      <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>
        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0)}
      </span>
    )}
  </div>
);

export default SalaryDetails;
