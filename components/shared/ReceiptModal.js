
import React from 'react';
import Icon from './Icon';

const ReceiptModal = ({ url, title, onClose }) => {
  return (
    <div className="modal-ov" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 10000000 }}>
      <div className="modal-box" style={{ maxWidth: 600 }}>
        <div className="modal-head">
          <span className="modal-title">Receipt: {title}</span>
          <button className="ib" onClick={onClose}><Icon n="x" size={14} color="var(--t2)"/></button>
        </div>
        <div className="modal-body" style={{ padding: 0 }}>
          <img src={url} alt="Receipt" style={{ width: '100%', display: 'block' }} />
        </div>
        <div className="modal-foot">
          <button className="btn bs btn-full" onClick={onClose}>Close</button>
          <a href={url} download={`receipt-${title.replace(/\s+/g, '-').toLowerCase()}.png`} className="btn btn-full" style={{ background: 'var(--blu)', color: '#fff', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Icon n="download" size={14} color="#fff"/> Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
