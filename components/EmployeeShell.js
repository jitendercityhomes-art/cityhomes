import React from 'react';

export default function EmployeeShell({ title, subtitle, children }) {
  return (
    <div className="employee-shell">
      <div className="ph">
        <div>
          <div className="pt">{title}</div>
          {subtitle ? <div className="ps">{subtitle}</div> : null}
        </div>
      </div>
      <div className="shell-content">{children}</div>
    </div>
  );
}
