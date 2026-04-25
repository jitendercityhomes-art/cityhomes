
import React from 'react';
import EmployeeLayout from '../../components/layouts/EmployeeLayout';
import Icon from '../../components/shared/Icon';
import { THEME } from '../../lib/constants';

const EmployeeDocuments = () => {
  const t = THEME.employee;

  return (
    <EmployeeLayout title="My Documents">
      <div className="ph">
        <div>
          <div className="pt">Documents</div>
          <div className="ps">Official letters and identity proofs</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {[
          { l: 'Offer Letter', s: 'PDF \u00b7 1.2MB' },
          { l: 'Appointment Letter', s: 'PDF \u00b7 0.8MB' },
          { l: 'ID Proof (Aadhaar)', s: 'JPG \u00b7 0.5MB' },
          { l: 'Address Proof', s: 'JPG \u00b7 0.4MB' }
        ].map(doc => (
          <div key={doc.l} className="cd" style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 15 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon n="doc" size={22} color="var(--t2)"/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{doc.l}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>{doc.s}</div>
            </div>
            <button className="ib"><Icon n="download" size={16}/></button>
          </div>
        ))}
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeDocuments;
