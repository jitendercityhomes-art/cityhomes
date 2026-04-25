
import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '../../components/layouts/SuperAdminLayout';
import Icon from '../../components/shared/Icon';
import Av from '../../components/shared/Avatar';
import { THEME, API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/router';

const SuperAdminAttendance = () => {
  const router = useRouter();
  const { globalStaff = [], globalBranches = [], selectedBranch, liveAttendance = [], user } = useAppContext();
  const t = THEME.superadmin;
  const [tab, setTab] = useState('live');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [savingAttendance, setSavingAttendance] = useState(false);

  const selectedBranchId = String(selectedBranch);
  const branchName = selectedBranch === 'all'
    ? 'All Branches'
    : globalBranches.find(b => String(b.id) === selectedBranchId)?.name || 'All Branches';

  // Live Attendance Processing
  const liveList = liveAttendance?.employees || [];
  const sortedLive = [...liveList].sort((a, b) => {
    if (!a.punchInTime) return 1;
    if (!b.punchInTime) return -1;
    return new Date(b.punchInTime) - new Date(a.punchInTime);
  });
  
  const filteredLive = selectedBranch === 'all'
    ? sortedLive
    : sortedLive.filter(s => s.branch === branchName);

  // Daily Attendance Fetching
  const fetchDaily = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await fetch(`${API_BASE}/attendance/live?date=${dateStr}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const list = data.employees || [];
        const sorted = [...list].sort((a, b) => {
          if (!a.punchInTime) return 1;
          if (!b.punchInTime) return -1;
          return new Date(b.punchInTime) - new Date(a.punchInTime);
        });
        setDailyData(sorted);
      }
    } catch (err) {
      console.error('Error fetching daily attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'daily') fetchDaily();
  }, [selectedDate, tab, selectedBranch]);

  const displayData = tab === 'live' ? filteredLive : dailyData;

  const counts = {
    all: displayData.length,
    in: displayData.filter(s => s.status === 'present' || s.status === 'pending').length,
    noPunch: displayData.filter(s => s.status === 'not_punched' || s.status === 'absent').length,
    halfDay: displayData.filter(s => s.status === 'half_day').length,
    paidLeave: displayData.filter(s => s.status === 'paid_leave').length,
  };

  const formatDate = (date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const moveDate = (delta) => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + delta));

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const exportCsv = (dataRows, headers, filename) => {
    const csv = [headers.join(','), ...dataRows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReport = () => {
    const headers = ['Staff', 'Branch', 'Punch In', 'Status'];
    const rows = displayData.map(s => [
      s.name,
      s.branch || 'Main Branch',
      s.punchInTime ? new Date(s.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
      s.status === 'present' || s.status === 'pending' ? (tab === 'live' ? 'In' : 'Present') : (tab === 'live' ? 'No Punch' : 'Absent')
    ]);
    exportCsv(rows, headers, `attendance-${tab}-${formatDate(selectedDate).replace(/ /g, '-')}.csv`);
  };

  const statusLabels = {
    present: 'PRESENT',
    absent: 'ABSENT',
    half_day: 'HALF DAY',
    paid_leave: 'PAID LEAVE',
    unpaid_leave: 'UNPAID LEAVE',
    week_off: 'WEEK OFF',
    holiday: 'HOLIDAY',
    half_day_leave: 'HALF DAY LEAVE'
  };

  const getAttendanceLabel = (status) => statusLabels[status] || 'ABSENT';

  const normalizeTime = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
    const [timePart, meridiem] = String(value).trim().split(' ');
    if (!timePart || !meridiem) return null;
    let [hours, minutes] = timePart.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    if (meridiem.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
    const d = new Date(selectedDate);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes, 0).toISOString();
  };

  const saveAttendanceForDay = async (staffId, status, extra = {}) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const requestBody = {
      status: status || 'absent',
      note: extra.note || '',
      punchInTime: extra.punchIn ? normalizeTime(extra.punchIn) : null,
      punchOutTime: extra.punchOut ? normalizeTime(extra.punchOut) : null,
      editReason: extra.editReason || `Updated attendance for ${dateStr}`
    };

    const res = await fetch(`${API_BASE}/attendance/employee/${staffId}/date/${dateStr}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend Error Response:', errorText); // Added logging
      throw new Error(errorText || 'Failed to save attendance');
    }
    return res.json();
  };

  const openEditModal = (staff) => {
    setEditModal({
      id: staff.id,
      name: staff.name,
      status: staff.status || 'absent',
      note: staff.note || '',
      punchIn: staff.punchInTime ? new Date(staff.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
      punchOut: staff.punchOutTime ? new Date(staff.punchOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
      displayLabel: getAttendanceLabel(staff.status)
    });
  };

  return (
    <SuperAdminLayout title="Attendance">
      <div className="ph">
        <div>
          <div className="pt">Attendance</div>
          <div className="ps">{branchName} · {formatDate(selectedDate)}</div>
        </div>

        <div className="pa">
          <div className="tabs" style={{ display: 'flex', alignItems: 'center', background: 'var(--s2)', padding: 4, borderRadius: 10, height: 38 }}>
            <div 
              className={`tab ${tab === 'live' ? 'on' : ''}`} 
              style={{ 
                height: 30, 
                padding: '0 20px', 
                borderRadius: 8, 
                fontSize: 12, 
                fontWeight: 700, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                background: tab === 'live' ? '#fff' : 'transparent',
                color: tab === 'live' ? 'var(--t1)' : 'var(--t3)',
                boxShadow: tab === 'live' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
              }} 
              onClick={() => setTab('live')}
            >
              Live
            </div>
            <div 
              className={`tab ${tab === 'daily' ? 'on' : ''}`} 
              style={{ 
                height: 30, 
                padding: '0 20px', 
                borderRadius: 8, 
                fontSize: 12, 
                fontWeight: 700, 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                background: tab === 'daily' ? '#fff' : 'transparent',
                color: tab === 'daily' ? 'var(--t1)' : 'var(--t3)',
                boxShadow: tab === 'daily' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
              }} 
              onClick={() => setTab('daily')}
            >
              Daily
            </div>
          </div>

          <button 
            className="btn btn-sm" 
            style={{ 
              height: 38, 
              padding: '0 18px', 
              borderRadius: 10, 
              background: 'var(--teal)', 
              color: '#fff', 
              fontSize: 12, 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }} 
            onClick={handleReport}
          >
            <Icon n="download" size={14} color="#fff" /> Report
          </button>
        </div>
      </div>

      {tab === 'live' && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          {[
            { label: 'All', value: counts.all, color: 'var(--blu)' },
            { label: 'In', value: counts.in, color: 'var(--grn)' },
            { label: 'No Punch', value: counts.noPunch, color: 'var(--red)' },
            { label: 'Half Day', value: counts.halfDay, color: 'var(--ora)' },
            { label: 'Paid Leave', value: counts.paidLeave, color: 'var(--pur)' }
          ].map(item => (
            <div key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid var(--br)', borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
              <span>{item.label}</span>
              <span style={{ background: 'var(--s1)', borderRadius: 8, padding: '2px 10px', color: 'var(--t2)', fontWeight: 800, fontSize: 11 }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'daily' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid var(--br)', borderRadius: 10, overflow: 'hidden' }}>
            <button className="ib" style={{ width: 36, height: 36, borderRight: '1px solid var(--br)' }} onClick={() => moveDate(-1)}><Icon n="chevron_right" size={14} style={{ transform: 'rotate(180deg)' }} /></button>
            <div style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: 'var(--t1)', minWidth: 120, textAlign: 'center' }}>{formatDate(selectedDate)}</div>
            <button className="ib" style={{ width: 36, height: 36, borderLeft: '1px solid var(--br)' }} onClick={() => moveDate(1)}><Icon n="chevron_right" size={14} /></button>
          </div>
        </div>
      )}

      <div className="cd" style={{ padding: 0, borderRadius: 16, border: '1px solid var(--br)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--s1)', borderBottom: '1px solid var(--br)' }}>
              <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: 11, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase' }}>Staff</th>
              <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: 11, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase' }}>Branch</th>
              <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: 11, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase' }}>Punch In</th>
              <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: 11, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase' }}>Status</th>
              {tab === 'daily' && <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: 11, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase' }}>Action</th>}
            </tr>
          </thead>
          <tbody>
            {displayData.map(s => (
              <tr 
                key={s.id} 
                style={{ borderBottom: '1px solid var(--s2)', cursor: 'pointer' }}
                onClick={() => router.push(`/superadmin/employees/${s.id}`)}
                className="hover-row"
              >
                <td style={{ padding: '14px 24px' }}>
                  <div className="av-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Av name={s.name} size={32} r={10} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--t1)' }}>{s.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 24px' }}><span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>{s.branch || '—'}</span></td>
                <td style={{ padding: '14px 24px' }}><span style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 700 }}>{s.punchInTime ? new Date(s.punchInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</span></td>
                <td style={{ padding: '14px 24px' }}>
                  <span style={{ 
                    fontSize: 10, 
                    fontWeight: 800, 
                    padding: '5px 12px', 
                    borderRadius: 8, 
                    color: 
                      s.status === 'present' || s.status === 'pending' ? 'var(--grn)' : 
                      s.status === 'half_day' ? 'var(--ora)' : 
                      s.status === 'paid_leave' ? 'var(--pur)' : 
                      s.status === 'half_day_leave' ? 'var(--blu)' : 
                      s.status === 'unpaid_leave' ? 'var(--teal)' : 
                      s.status === 'week_off' ? 'var(--blu)' : 
                      s.status === 'holiday' ? 'var(--amb)' : 
                      'var(--red)', 
                    background: 
                      s.status === 'present' || s.status === 'pending' ? 'var(--grnDim)' : 
                      s.status === 'half_day' ? 'rgba(217, 119, 6, 0.1)' : 
                      s.status === 'paid_leave' ? 'rgba(124, 58, 237, 0.1)' : 
                      s.status === 'half_day_leave' ? 'rgba(59, 130, 246, 0.1)' : 
                      s.status === 'unpaid_leave' ? 'rgba(45, 212, 191, 0.1)' : 
                      s.status === 'week_off' ? 'rgba(59, 130, 246, 0.08)' : 
                      s.status === 'holiday' ? 'rgba(251, 191, 36, 0.12)' : 
                      'var(--rd)' 
                  }}>
                    {getAttendanceLabel(s.status)}
                  </span>
                </td>
                {tab === 'daily' && (
                  <td style={{ padding: '14px 24px' }}>
                    <button
                      className="btn bs btn-sm"
                      style={{ fontSize: 11, fontWeight: 700, borderRadius: 8, height: 32 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(s);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {displayData.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--t3)', fontSize: 14 }}>
            {loading ? 'Fetching attendance...' : 'No records found for this selection.'}
          </div>
        )}
      </div>

      {editModal && (
        <div className="modal-ov" onClick={(e) => e.target === e.currentTarget && setEditModal(null)}>
          <div className="modal-box" style={{ maxWidth: 380 }}>
            <div className="modal-head">
              <div>
                <div className="modal-title">{selectedDate.getDate()} {MONTH_NAMES[selectedDate.getMonth()]} — Edit Attendance</div>
                <div style={{ fontSize: 10, color: 'var(--t2)', marginTop: 2 }}>{editModal.name}</div>
              </div>
              <button style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--s2)', border: '1px solid var(--br)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditModal(null)}>
                <Icon n="x" size={14} color="var(--t2)" />
              </button>
            </div>

            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 10 }}>Attendance Status</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {[
                  { value: 'present', label: 'PRESENT', color: 'var(--grn)', bg: 'rgba(16, 185, 129, 0.12)' },
                  { value: 'absent', label: 'ABSENT', color: 'var(--red)', bg: 'rgba(239, 68, 68, 0.1)' },
                  { value: 'half_day', label: 'HALF DAY', color: 'var(--amb)', bg: 'rgba(251, 191, 36, 0.12)' },
                  { value: 'week_off', label: 'WEEK OFF', color: 'var(--blu)', bg: 'rgba(59, 130, 246, 0.08)' },
                  { value: 'holiday', label: 'HOLIDAY', color: 'var(--teal)', bg: 'rgba(45, 212, 191, 0.12)' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setEditModal((m) => ({ ...m, status: option.value, displayLabel: option.label }))}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 20,
                      border: `2px solid ${editModal.status === option.value ? option.color : 'var(--br2)'}`,
                      background: editModal.status === option.value ? option.bg : 'var(--s1)',
                      color: editModal.status === option.value ? option.color : 'var(--t2)',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'Inter',
                      transition: 'all .15s'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>Leave Type</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {[
                  { value: 'paid_leave', label: 'PAID LEAVE', color: 'var(--pur)' },
                  { value: 'half_day_leave', label: 'HALF DAY LEAVE', color: 'var(--blu)' },
                  { value: 'unpaid_leave', label: 'UNPAID LEAVE', color: 'var(--teal)' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setEditModal((m) => ({ ...m, status: option.value, displayLabel: option.label }))}
                    style={{
                      padding: '7px 13px',
                      borderRadius: 20,
                      border: `2px solid ${editModal.status === option.value ? option.color : 'var(--br2)'}`,
                      background: editModal.status === option.value ? `${option.color}15` : 'var(--s1)',
                      color: editModal.status === option.value ? option.color : 'var(--t2)',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'Inter',
                      transition: 'all .15s'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: '12px 14px', background: 'var(--s2)', borderRadius: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,var(--pur),var(--blu))', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                    {editModal.name?.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                      <input 
                        type="text" 
                        value={editModal.punchIn || ''} 
                        onChange={(e) => setEditModal(m => ({ ...m, punchIn: e.target.value }))}
                        placeholder="No punch in"
                        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid transparent', fontSize: 12, fontWeight: 700, width: 85, color: 'var(--t1)', padding: 0 }}
                        onFocus={(e) => e.target.style.borderBottom = '1px solid var(--br)'}
                        onBlur={(e) => e.target.style.borderBottom = '1px solid transparent'}
                      />
                      <span style={{ color: 'var(--grn)', fontWeight: 800 }}>• In</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input 
                        type="text" 
                        value={editModal.punchOut || ''} 
                        onChange={(e) => setEditModal(m => ({ ...m, punchOut: e.target.value }))}
                        placeholder="No punch out"
                        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid transparent', fontSize: 12, fontWeight: 700, width: 85, color: 'var(--t1)', padding: 0 }}
                        onFocus={(e) => e.target.style.borderBottom = '1px solid var(--br)'}
                        onBlur={(e) => e.target.style.borderBottom = '1px solid transparent'}
                      />
                      <span style={{ color: 'var(--red)', fontWeight: 800 }}>• Out</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setEditModal((m) => ({ ...m, punchIn: m.punchIn ? null : '10:00 AM' }))}
                    style={{ flex: 1, background: 'none', border: '1px solid var(--br2)', borderRadius: 8, padding: '8px', fontSize: 11, fontWeight: 700, color: 'var(--blu)', cursor: 'pointer' }}
                  >
                    {editModal.punchIn ? 'REMOVE PUNCH IN' : '+ ADD PUNCH IN'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditModal((m) => ({ ...m, punchOut: m.punchOut ? null : '06:00 PM' }))}
                    style={{ flex: 1, background: 'none', border: '1px solid var(--br2)', borderRadius: 8, padding: '8px', fontSize: 11, fontWeight: 700, color: 'var(--blu)', cursor: 'pointer' }}
                  >
                    {editModal.punchOut ? 'REMOVE PUNCH OUT' : '+ ADD PUNCH OUT'}
                  </button>
                </div>
              </div>

              <textarea
                className="f-in"
                rows={2}
                placeholder="Add Note..."
                value={editModal.note || ''}
                onChange={(e) => setEditModal((m) => ({ ...m, note: e.target.value }))}
                style={{ resize: 'vertical', marginBottom: 0, width: '100%', borderRadius: 12, border: '1px solid var(--br)', padding: 10 }}
              />
            </div>

            <div className="modal-foot">
              <button className="btn bs btn-full" onClick={() => setEditModal(null)}>Cancel</button>
              <button
                className="btn btn-full"
                style={{ background: 'var(--teal)', color: '#fff' }}
                onClick={async () => {
                  setSavingAttendance(true);
                  try {
                    await saveAttendanceForDay(editModal.id, editModal.status, {
                      note: editModal.note,
                      punchIn: editModal.punchIn,
                      punchOut: editModal.punchOut,
                      editReason: `Updated attendance for ${selectedDate.toISOString().split('T')[0]}`
                    });
                    await fetchDaily();
                    setEditModal(null);
                  } catch (err) {
                    console.error('Save failed', err);
                    alert('Failed to save attendance changes.');
                  } finally {
                    setSavingAttendance(false);
                  }
                }}
                disabled={savingAttendance}
              >
                {savingAttendance ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
};

export default SuperAdminAttendance;
