
import React, { useState } from 'react';
import EmployeeLayout from '../../components/layouts/EmployeeLayout';
import EmpDetail from '../../components/employee-detail/EmpDetail';
import PersonalForm from '../../components/employee-detail/PersonalForm';
import { THEME } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const EmployeeProfile = () => {
  const { user, setUser, salaryData, salarySettings, globalReimb, yearlyHolidays, setSalaryData, setGlobalActivity } = useAppContext();
  const [editing, setEditing] = useState(false);
  const t = THEME.employee;

  return (
    <EmployeeLayout title="My Profile">
      <div className="ph">
        <div>
          <div className="pt">My Profile</div>
          <div className="ps">Personal and professional details</div>
        </div>
      </div>

      {editing ? (
        <PersonalForm 
          emp={user}
          onBack={() => setEditing(false)}
          onSaved={(updated) => updated?.id && setUser(updated)}
          accentColor={t.acc} 
        />
      ) : (
        <EmpDetail 
          emp={user} 
          onBack={() => setEditing(true)} 
          accentColor={t.acc} 
          userRole="employee"
          salaryData={salaryData}
          salarySettings={salarySettings}
          globalReimb={globalReimb}
          yearlyHolidays={yearlyHolidays}
          setSalaryData={setSalaryData}
          setGlobalActivity={setGlobalActivity}
        />
      )}
    </EmployeeLayout>
  );
};

export default EmployeeProfile;
