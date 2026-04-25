
import React, { useState } from 'react';
import HRLayout from '../../components/layouts/HRLayout';
import Icon from '../../components/shared/Icon';
import { THEME } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const HRAttendance = () => {
  const { user } = useAppContext();
  const t = THEME.hr;
  const [month, setMonth] = useState(3);
  const [year, setYear] = useState(2026);

  return (
    <HRLayout title="My Attendance">
      <div className="ph">
        <div>
          <div className="pt">My Attendance</div>
          <div className="ps">March 2026 \u00b7 Personal records</div>
        </div>
      </div>

      <div className="cal-sum">
        <div className="cal-col"><div className="cal-n" style={{ color: 'var(--grn)' }}>15</div><div className="cal-l">Present</div></div>
        <div className="cal-col"><div className="cal-n" style={{ color: 'var(--red)' }}>2</div><div className="cal-l">Absent</div></div>
        <div className="cal-col"><div className="cal-n" style={{ color: 'var(--teal)' }}>2</div><div className="cal-l">Holiday</div></div>
        <div className="cal-col"><div className="cal-n" style={{ color: 'var(--blu)' }}>4</div><div className="cal-l">Week Off</div></div>
      </div>

      <div className="cd">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 15, borderBottom: '1px solid var(--br)' }}>
          <button className="dnb dnl" style={{ background: t.acc }}>\u2039</button>
          <div className="dl" style={{ flex: 1, justifyContent: 'center' }}><Icon n="calendar" size={13}/> March 2026</div>
          <button className="dnb dnr">\u203a</button>
        </div>
        <div style={{ padding: 15 }}>
          <div className="cg" style={{ marginBottom: 8 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="ch">{d}</div>)}
          </div>
          <div className="cg">
            {Array.from({ length: 31 }, (_, i) => {
              const d = i + 1;
              const isP = d <= 15;
              return (
                <div key={d} className={`day ${isP ? 'dp' : 'da'}`}>
                  <div className="day-num">{String(d).padStart(2, '0')}</div>
                  <div style={{ fontSize: 8, fontWeight: 700, marginTop: 8, color: isP ? 'var(--grn)' : 'var(--red)' }}>{isP ? 'PRESENT' : 'ABSENT'}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </HRLayout>
  );
};

export default HRAttendance;
