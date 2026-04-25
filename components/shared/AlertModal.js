
import React from 'react';
import Icon from './Icon';

const AlertModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'confirm', // 'confirm', 'success', 'error'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  accentColor = 'var(--teal)'
}) => {
  if (!isOpen) return null;

  const isConfirm = type === 'confirm';
  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="modal-ov" style={{ zIndex: 10001, backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.4)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ 
        maxWidth: 400, 
        textAlign: 'center', 
        padding: '40px 32px', 
        borderRadius: 24, 
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        border: '1px solid var(--br)'
      }}>
        <div style={{ 
          width: 72, 
          height: 72, 
          borderRadius: 22, 
          background: isError ? 'rgba(239, 68, 68, 0.08)' : isSuccess ? 'rgba(0, 168, 132, 0.08)' : 'rgba(59, 130, 246, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          transform: 'rotate(-5deg)'
        }}>
          {isError && <Icon n="alert" size={32} color="var(--red)" />}
          {isSuccess && <Icon n="check" size={32} color="var(--teal)" />}
          {isConfirm && <Icon n="info" size={32} color="#3b82f6" />}
        </div>

        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--t1)', marginBottom: 12, letterSpacing: '-0.5px' }}>{title}</div>
        <div style={{ fontSize: 15, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 32 }}>{message}</div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          {isConfirm ? (
            <>
              <button className="btn bs" style={{ flex: 1, height: 48, borderRadius: 12, fontWeight: 700, fontSize: 14 }} onClick={onClose}>{cancelText}</button>
              <button className="btn" style={{ flex: 1, height: 48, borderRadius: 12, background: isError ? 'var(--red)' : accentColor, color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: `0 8px 20px ${isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 168, 132, 0.3)'}` }} onClick={onConfirm}>{confirmText}</button>
            </>
          ) : (
            <button className="btn" style={{ width: '100%', height: 48, borderRadius: 12, background: isError ? 'var(--red)' : accentColor, color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: `0 8px 20px ${isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 168, 132, 0.3)'}` }} onClick={onClose}>Understood</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
