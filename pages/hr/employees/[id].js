import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import HRLayout from '../../../components/layouts/HRLayout';
import Icon from '../../../components/shared/Icon';
import Av from '../../../components/shared/Avatar';
import { THEME } from '../../../lib/constants';
import { useAppContext } from '../../../context/AppContext';

const EmployeeDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { globalStaff } = useAppContext();
  const t = THEME.hr;
  const [employee, setEmployee] = useState(null);
  const [subTab, setSubTab] = useState('attendance');

  useEffect(() => {
    if (id && globalStaff?.length) {
      const emp = globalStaff.find(e => String(e.id) === String(id));
      setEmployee(emp);
    }
  }, [id, globalStaff]);

  const handleBack = () => router.push('/hr/employees');

  if (!employee) {
    return (
      <HRLayout title="Employee Details">
        <div className="ph" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 16, color: 'var(--t2)' }}>Loading...</div>
        </div>
      </HRLayout>
    );
  }

  const branchLabel = employee.branch?.name || employee.branch || employee.branch_id || 'Palava';
  const roleLabel = employee.role || employee.designation || 'Staff';

  return (
    <HRLayout title={`${employee.name} - Employee Details`}>
      <div className="ph" style={{ marginBottom: 20 }}>
        <button
          className="bk"
          onClick={handleBack}
          type="button"
        >
          <Icon n="arrow_left" size={16} color="var(--t2)" />
          <span className="bkl">Back</span>
        </button>
      </div>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 20px' }}>
        <div className="cd" style={{ padding: '28px 24px', marginBottom: 20, border: '1px solid var(--br)', borderRadius: 24, background: 'white' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Av name={employee.name} size={90} r={24} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)' }}>{employee.name}</div>
              <div style={{ fontSize: 13, color: 'var(--t2)', marginTop: 6 }}>{employee.phone || 'N/A'}</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 4 }}>{roleLabel} · {employee.dept || 'Main'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
            {[
              { label: 'Call', icon: 'phone' },
              { label: 'Text', icon: 'message' },
              { label: 'Location', icon: 'map_pin' },
              { label: 'CRM', icon: 'user' }
            ].map(item => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 100,
                  gap: 10,
                  background: 'white',
                  borderRadius: 16,
                  border: '1px solid var(--br)'
                }}
              >
                <Icon n={item.icon} size={20} color={t.acc} />
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="cd" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--br)', background: 'white' }}>
            {[
              { id: 'attendance', label: 'Attendance', icon: 'calendar' },
              { id: 'salary', label: 'Salary', icon: 'dollar' },
              { id: 'notes', label: 'Notes', icon: 'note' }
            ].map(tab => (
              <div
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                style={{
                  padding: '12px 16px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: subTab === tab.id ? t.acc : 'var(--t2)',
                  cursor: 'pointer',
                  borderBottom: `2px solid ${subTab === tab.id ? t.acc : 'transparent'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s'
                }}
              >
                <Icon n={tab.icon} size={14} color={subTab === tab.id ? t.acc : 'var(--t2)'} />
                {tab.label}
              </div>
            ))}
          </div>

          {subTab === 'attendance' && (
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
                <div style={{ flex: 1, padding: 16, borderRadius: 16, border: '1px solid var(--br)', background: 'var(--gd)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grn)', marginBottom: 10 }}>ATTENDANCE</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon n="check" size={16} color="var(--grn)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>Mark All Present</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)' }}>One click attendance update</div>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, padding: 16, borderRadius: 16, border: '1px solid var(--br)', background: 'var(--s2)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', marginBottom: 10 }}>LOCATION</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon n="map_pin" size={16} color={t.acc} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>Live Location</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)' }}>Tracked in real time</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 20 }}>
                {[
                  { label: 'Present', value: 0, color: 'var(--grn)' },
                  { label: 'Absent', value: 0, color: 'var(--red)' },
                  { label: 'Half Day', value: 0, color: 'var(--t1)' },
                  { label: 'Week Off', value: 0, color: 'var(--t1)' }
                ].map(item => (
                  <div key={item.label} style={{ padding: 16, borderRadius: 16, background: 'white', border: '1px solid var(--br)', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 6 }}>{item.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 8 }}>
                {Array.from({ length: 7 }, (_, idx) => idx + 1).map(day => (
                  <div key={day} style={{ minHeight: 90, borderRadius: 16, background: day === 7 ? 'rgba(0, 168, 132, 0.12)' : 'rgba(15, 23, 42, 0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 12, color: day === 7 ? t.acc : 'var(--t3)', fontWeight: 700 }}>
                    <div style={{ fontSize: 18 }}>{String(day).padStart(2, '0')}</div>
                    <div style={{ fontSize: 10, marginTop: 4 }}>{day === 7 ? 'WEEK OFF' : 'WORK DAY'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {subTab === 'salary' && (
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 16 }}>Salary Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
                {[
                  { label: 'Basic Salary', value: '0' },
                  { label: 'HRA', value: '0' },
                  { label: 'Dearness Allowance', value: '0' },
                  { label: 'Net Payable', value: '0' }
                ].map(item => (
                  <div key={item.label} style={{ background: 'var(--s2)', padding: 16, borderRadius: 16 }}>
                    <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>{item.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: t.acc }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-full" style={{ background: t.acc, color: '#fff', marginTop: 16, borderRadius: 12 }}>
                View Payslips
              </button>
            </div>
          )}

          {subTab === 'notes' && (
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 16 }}>Notes</div>
              <textarea
                placeholder="Add notes about this employee..."
                style={{
                  width: '100%',
                  minHeight: 120,
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid var(--br)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  resize: 'none'
                }}
              />
              <button className="btn btn-full" style={{ background: t.acc, color: '#fff', marginTop: 12, borderRadius: 12 }}>
                Save Notes
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
          {[
            {
              title: 'Personal Details',
              icon: 'user',
              items: [
                ['Date of Birth', employee.dob || 'Not set'],
                ['Gender', employee.gender || 'Not set'],
                ['Marital Status', employee.marital || 'Not set'],
                ['Blood Group', employee.blood || 'Not set']
              ]
            },
            {
              title: 'Current Employment',
              icon: 'briefcase',
              items: [
                ['Designation', roleLabel],
                ['Department', employee.dept || 'Main'],
                ['Branch', branchLabel],
                ['Joining Date', employee.doj || 'Not set']
              ]
            },
            {
              title: 'Contact Details',
              icon: 'phone',
              items: [
                ['Address', employee.address || 'Not set'],
                ['Emergency Contact', employee.emName || 'Not set'],
                ['Emergency Phone', employee.emPhone || 'Not set'],
                ['Phone', employee.phone || 'Not set']
              ]
            }
          ].map((section, index) => (
            <div key={index} className="cd" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--br)' }}>
                <Icon n={section.icon} size={16} color={t.acc} />
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{section.title}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px 40px' }}>
                {section.items.map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, color: 'var(--t1)', fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {[
            { title: 'Attendance Details', icon: 'calendar' },
            { title: 'Salary Details', icon: 'dollar' },
            { title: 'Bank Details', icon: 'bank', status: 'Not Verified' }
          ].map((section, index) => (
            <div key={index} className="cd" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon n={section.icon} size={16} color="var(--t2)" />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>{section.title}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {section.status && (
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)', background: 'var(--rd)', padding: '4px 10px', borderRadius: 6 }}>{section.status}</div>
                )}
                <Icon n="chevron_right" size={16} color="var(--t3)" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </HRLayout>
  );
};

export default EmployeeDetail;
