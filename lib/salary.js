
export const getMonthDays = (m, y) => {
  if (m === 2) {
    return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0) ? 29 : 28;
  }
  return [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m];
};

export const countPaidOffDays = (m, y, settings, deptWeekOffs) => {
  const totalDays = getMonthDays(m, y);
  let weekoffs = 0;
  let paidHols = 0;
  
  // Use department-specific week offs if provided, otherwise fallback to settings or Sunday
  const wo = (deptWeekOffs && deptWeekOffs.length > 0) ? deptWeekOffs : (settings.weeklyOffDays || [0]);
  const hols = settings.paidHolidays || [];

  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(y, m - 1, d);
    const day = date.getDay();
    const dateKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isHoliday = Array.isArray(hols)
      ? hols.includes(dateKey) || hols.includes(d)
      : !!hols[dateKey] || !!hols[d];

    if (wo.includes(day)) weekoffs++;
    else if (isHoliday) paidHols++;
  }
  return { weekoffs, paidHols };
};

export const calcSalary = (sd, reimbAmt = 0, settings, deptWeekOffs) => {
  const { basic = 0, presentDays = 0, halfDays = 0, paidLeaves = 0, bonus = 0, overtime = 0, incentive = 0, month, year } = sd;
  const totalDays = settings.periodType === 'fixed' ? settings.fixedDays : getMonthDays(month, year);
  const { weekoffs, paidHols } = countPaidOffDays(month, year, settings, deptWeekOffs);
  
  const paidDays = Number(presentDays) + weekoffs + paidHols + (Number(halfDays) * 0.5) + (Number(paidLeaves) * 1.0);
  const perDay = basic / totalDays;
  const earnedBasic = Math.round(perDay * paidDays);
  const lopDays = Math.max(0, totalDays - paidDays);
  const lopAmt = Math.round(perDay * lopDays);
  
  const gross = earnedBasic + Number(bonus) + Number(overtime) + Number(incentive) + Number(reimbAmt);
  const payable = gross - 200; // PT
  
  return {
    totalDays,
    weekoffs,
    paidHols,
    paidDays,
    earnedBasic,
    lopDays,
    lopAmt,
    gross,
    payable,
    perDay: Math.round(perDay)
  };
};
