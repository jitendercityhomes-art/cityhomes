
import React from 'react';
import Icon from './Icon';
import { CITYHOMES_LOGO, DEFAULT_SALARY_SETTINGS } from '../../lib/constants';
import { calcSalary } from '../../lib/salary';

const numToWords = n => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const two = n => n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  const three = n => n >= 100 ? ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + two(n % 100) : '') : two(n);
  if (!n || n === 0) return 'Zero Rupees only';
  n = Math.round(n);
  const parts = [];
  const cr = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thou = Math.floor(n / 1000);
  n %= 1000;
  if (cr) parts.push(three(cr) + ' Crore');
  if (lakh) parts.push(three(lakh) + ' Lakh');
  if (thou) parts.push(three(thou) + ' Thousand');
  if (n) parts.push(three(n));
  return parts.join(' ') + ' Rupees only';
};

const PayslipModal = ({ onClose, empData, salData, salSettings, month, year, globalReimb }) => {
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const ss = salSettings || DEFAULT_SALARY_SETTINGS;
  const sd = salData || { basic: 0, presentDays: 0, halfDays: 0, paidLeaves: 0, unpaidLeaveDays: 0, month: month || 3, year: year || 2026, hra: 0, da: 0, bonus: 0, overtime: 0, incentive: 0 };
  const reimbAmt = (globalReimb || []).filter(r => r.name === empData?.name && r.status === 'approved').reduce((a, r) => a + r.amount, 0);
  const deptWeekOffs = empData?.department?.week_off_days || [];
  const sal = calcSalary(sd, reimbAmt, ss, deptWeekOffs);
  const totalDays = sal.totalDays || 31;
  const earnings = [
    ['Basic', sd.basic_earned || sal.earnedBasic || sd.basic || 0],
    ...(sd.hra ? [['HRA', sd.hra]] : []),
    ...(sd.da ? [['DA', sd.da]] : []),
    ...(sd.bonus ? [['Bonus', sd.bonus]] : []),
    ...(sd.overtime ? [['Overtime', sd.overtime]] : []),
    ...(sd.incentive ? [['Incentive', sd.incentive]] : []),
    ...(sd.reimbursement_amount ? [['Reimbursement', sd.reimbursement_amount]] : reimbAmt ? [['Reimbursement', reimbAmt]] : [])
  ].filter(([, v]) => v !== undefined);
  const deductions = [['Professional Tax', 200]];
  const totalEarn = earnings.reduce((a, [, v]) => a + Number(v), 0);
  const totalDed = deductions.reduce((a, [, v]) => a + Number(v), 0);
  const net = totalEarn - totalDed;
  const fmt = v => Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const downloadPDF = () => {
    const printContent = document.getElementById('payslip-print-area').innerHTML;
    const w = window.open('', '_blank', 'width=700,height=900');
    w.document.write(`<!DOCTYPE html><html><head><title>Payslip</title><style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{font-family:Arial,sans-serif;padding:28px 32px;color:#222;font-size:10px;}
      .ps-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;}
      .ps-right{text-align:right;}
      .ps-title{font-size:26px;font-weight:800;color:#1a1a1a;letter-spacing:-1px;}
      .ps-mo{font-size:14px;font-weight:700;color:#c0392b;margin-top:2px;}
      .ps-co{font-size:11px;font-weight:700;margin-bottom:2px;}
      .ps-addr{font-size:9px;color:#666;line-height:1.4;}
      .ps-red-line{border:none;border-top:2.5px solid #c0392b;margin:8px 0;}
      .ps-gray-line{border:none;border-top:1px solid #ddd;margin:6px 0;}
      .ps-ename{font-size:13px;font-weight:800;margin:10px 0 8px;}
      .ps-dtgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px 12px;margin-bottom:7px;}
      .ps-dt label{font-size:7.5px;color:#888;display:block;margin-bottom:2px;text-transform:uppercase;}
      .ps-dt span{font-size:9px;font-weight:600;}
      .ps-sec{font-size:8.5px;font-weight:700;color:#444;text-transform:uppercase;letter-spacing:.5px;margin:10px 0 5px;}
      .ps-days{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;background:#f8f8f8;border-radius:7px;padding:9px 12px;margin-bottom:10px;}
      .ps-day label{font-size:7.5px;color:#888;display:block;margin-bottom:2px;}
      .ps-day span{font-size:13px;font-weight:800;}
      .ps-split{display:grid;grid-template-columns:1fr 1px 1fr;gap:0 14px;}
      .ps-vline{background:#ddd;width:1px;}
      .ps-row{display:flex;justify-content:space-between;padding:2.5px 0;font-size:9px;}
      .ps-row.bold{font-weight:800;font-size:10px;border-top:1.5px solid #ddd;padding-top:4px;margin-top:4px;}
      .ps-netbox{background:#f5f5f5;border-radius:8px;padding:10px 14px;margin:12px 0 6px;}
      .ps-netrow{display:flex;justify-content:space-between;font-size:10px;padding:2px 0;}
      .ps-netrow.big{font-size:12px;font-weight:700;}
      .ps-note{font-size:7.5px;color:#888;margin:6px 0 3px;}
      .ps-footer{font-size:7.5px;color:#aaa;font-style:italic;}
      img{max-height:45px;object-fit:contain;}
    </style></head><body>${printContent}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); }, 500);
  };

  return (
    <div className="payslip-modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="payslip-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#222' }}>Pay Slip — {MONTHS[(month || 3) - 1]} {year || 2026}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn bs btn-sm" onClick={downloadPDF}><Icon n="download" size={13}/>Download PDF</button>
            <button style={{ width: 28, height: 28, borderRadius: 7, background: '#f0f0f0', border: '1px solid #ddd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}><Icon n="x" size={14}/></button>
          </div>
        </div>
        <div id="payslip-print-area" className="ps-wrap" style={{ padding: '28px 32px', fontFamily: "'Arial',sans-serif" }}>
          <div className="ps-top">
            <div>
              <img src={CITYHOMES_LOGO} alt="CityHomes" style={{ height: 44, objectFit: 'contain', marginBottom: 6 }} />
              <div className="ps-co" style={{ fontSize: 11.5, fontWeight: 700, color: '#1a1a1a' }}>CITYHOMES PROPERTY SERVICES</div>
              <div className="ps-addr" style={{ fontSize: 9.5, color: '#666' }}>Mumbai, Maharashtra</div>
            </div>
            <div className="ps-right">
              <div className="ps-title" style={{ fontSize: 26, fontWeight: 800, color: '#1a1a1a', letterSpacing: -1 }}>PAYSLIP</div>
              <div className="ps-mo" style={{ fontSize: 14, fontWeight: 700, color: '#c0392b' }}>{MONTHS[(month || 3) - 1].toUpperCase()} {year || 2026}</div>
            </div>
          </div>
          <div className="ps-red-line" style={{ border: 'none', borderTop: '2.5px solid #c0392b', margin: '8px 0' }} />
          <div className="ps-ename" style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a', margin: '10px 0 8px' }}>{(empData?.name || 'Employee').toUpperCase()}</div>
          <div className="ps-gray-line" style={{ border: 'none', borderTop: '1px solid #ddd', margin: '6px 0' }} />
          <div className="ps-dtgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '6px 12px', marginBottom: 7 }}>
            {[
              ['Employee Number', empData?.employee_id || `EMP${empData?.id?.toString().padStart(3, '0') || '000'}`],
              ['Date Joined', empData?.date_of_joining ? new Date(empData.date_of_joining).toLocaleDateString('en-IN') : empData?.dob || '—'],
              ['Department', empData?.department?.name || empData?.dept || '—'],
              ['Sub Department', 'N/A'],
              ['Designation', empData?.designation || empData?.role || '—'],
              ['Payment Mode', 'Bank Transfer'],
              ['Bank', '—'],
              ['Bank IFSC', '—'],
              ['Bank Account', '—'],
              ['UAN', 'No'],
              ['PF Number', 'N/A'],
              ['PAN Number', '—']
            ].map(([label, val]) => (
              <div key={label} className="ps-dt" style={{ marginBottom: 4 }}>
                <label style={{ fontSize: 7.5, color: '#888', display: 'block', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</label>
                <span style={{ fontSize: 9, fontWeight: 600, color: '#1a1a1a' }}>{val}</span>
              </div>
            ))}
          </div>
          <div className="ps-gray-line" style={{ border: 'none', borderTop: '1px solid #ddd', margin: '6px 0' }} />
          <div className="ps-sec" style={{ fontSize: 9, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: 0.5, margin: '10px 0 5px' }}>SALARY DETAILS</div>
          <div className="ps-days" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4, background: '#f8f8f8', borderRadius: 7, padding: '9px 12px', marginBottom: 10 }}>
            {[
              ['Present Days', `${sd.presentDays || 0}`],
              ['Half Days', `${sd.halfDays || 0}`],
              ['Paid Leaves', `${sd.paidLeaves || 0}`],
              ['Unpaid Leaves', `${sd.unpaidLeaveDays || 0}`],
              ['Week Offs', `${sal.weekoffs || 0}`],
              ['Paid Holidays', `${sal.paidHols || 0}`],
              ['Loss Of Pay', `${sal.lopDays || 0}`],
              ['Total Working Days', `${totalDays}`],
              ['Days Payable', `${sal.paidDays || 0}`]
            ].map(([label, val]) => (
              <div key={label} className="ps-day">
                <label style={{ fontSize: 7.5, color: '#888', display: 'block', marginBottom: 2 }}>{label}</label>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a' }}>{val}</span>
              </div>
            ))}
          </div>
          <div className="ps-gray-line" style={{ border: 'none', borderTop: '1px solid #ddd', margin: '6px 0' }} />
          <div className="ps-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: '0 14px' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#1a1a1a', marginBottom: 7 }}>EARNINGS</div>
              {earnings.map(([label, amt]) => (
                <div key={label} className="ps-row" style={{ display: 'flex', justifySelf: 'space-between', padding: '2.5px 0', fontSize: 9 }}>
                  <span>{label}</span><span>{fmt(amt)}</span>
                </div>
              ))}
              <div className="ps-row bold" style={{ display: 'flex', justifySelf: 'space-between', fontWeight: 800, fontSize: 10, borderTop: '1.5px solid #ddd', paddingTop: 4, marginTop: 4 }}>
                <span>Total Earnings (A)</span><span>{fmt(totalEarn)}</span>
              </div>
            </div>
            <div className="ps-vline" style={{ background: '#ddd', width: 1 }} />
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#1a1a1a', marginBottom: 7 }}>TAXES & DEDUCTIONS</div>
              {deductions.map(([label, amt]) => (
                <div key={label} className="ps-row" style={{ display: 'flex', justifySelf: 'space-between', padding: '2.5px 0', fontSize: 9 }}>
                  <span>{label}</span><span>{fmt(amt)}</span>
                </div>
              ))}
              <div className="ps-row bold" style={{ display: 'flex', justifySelf: 'space-between', fontWeight: 800, fontSize: 10, borderTop: '1.5px solid #ddd', paddingTop: 4, marginTop: 4 }}>
                <span>Total Taxes & Deductions (B)</span><span>{fmt(totalDed)}</span>
              </div>
            </div>
          </div>
          <div className="ps-gray-line" style={{ border: 'none', borderTop: '1px solid #ddd', margin: '10px 0 6px' }} />
          <div className="ps-note" style={{ fontSize: 8, color: '#888', margin: '6px 0 3px' }}>**Note : All amounts displayed in this payslip are in INR</div>
          <div className="ps-netbox" style={{ background: '#f5f5f5', borderRadius: 8, padding: '10px 14px', margin: '8px 0 6px' }}>
            <div className="ps-netrow" style={{ display: 'flex', justifySelf: 'space-between', fontSize: 10, padding: '2px 0' }}>
              <span>Net Salary Payable ( A - B )</span><span style={{ fontWeight: 700 }}>{fmt(net)}</span>
            </div>
            <div className="ps-netrow" style={{ display: 'flex', justifySelf: 'space-between', fontSize: 9.5, padding: '2px 0', color: '#555' }}>
              <span>Net Salary in words</span><span style={{ fontWeight: 700, textAlign: 'right', maxWidth: 300 }}>{numToWords(net)}</span>
            </div>
          </div>
          <div className="ps-footer" style={{ fontSize: 7.5, color: '#aaa', fontStyle: 'italic', marginTop: 8 }}>*This is computer generated statement, does not require signature.</div>
        </div>
      </div>
    </div>
  );
};

export default PayslipModal;
