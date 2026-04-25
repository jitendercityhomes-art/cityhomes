
import React, { useState } from 'react';
import Icon from './Icon';
import dynamic from 'next/dynamic';

const BranchMap = dynamic(() => import('./BranchMap'), { 
  ssr: false,
  loading: () => <div style={{ display: 'grid', placeItems: 'center', height: '100%', fontSize: 12, color: 'var(--t3)' }}>Loading Map...</div>
});

const AddBranchModal = ({ onClose, onAdd, accentColor, editData }) => {
  const [data, setData] = useState(editData || { 
    name: '', 
    address: '', 
    city: '',
    color: '#00A884', 
    lat: 19.2183, 
    lng: 73.1302,
    radius: 200 
  });
  const [loading, setLoading] = useState(false);
  const [fetchingAddr, setFetchingAddr] = useState(false);

  const fetchAddress = async (lat, lng) => {
    setFetchingAddr(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const result = await res.json();
      if (result && result.address) {
        const addr = result.display_name;
        const city = result.address.city || result.address.town || result.address.village || result.address.suburb || '';
        setData(prev => ({ ...prev, address: addr, city: city }));
      }
    } catch (err) {
      console.error('Error fetching address:', err);
    } finally {
      setFetchingAddr(false);
    }
  };

  const handleLocationChange = (lat, lng) => {
    setData(prev => ({ ...prev, lat, lng }));
    fetchAddress(lat, lng);
  };

  const handleSave = async () => {
    if (!data.name || !data.address || !data.city) {
      alert('Name, Address, and City are required');
      return;
    }
    setLoading(true);
    await onAdd(data);
    setLoading(false);
    onClose();
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setData(prev => ({ ...prev, lat: latitude, lng: longitude }));
        fetchAddress(latitude, longitude);
      }, (error) => {
        alert('Unable to get current location: ' + error.message);
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="modal-ov" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 550, width: '90%' }}>
        <div className="modal-head">
          <span className="modal-title">{editData ? 'Edit Branch' : 'Create New Branch'}</span>
          <button className="ib" onClick={onClose}><Icon n="x" size={14}/></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="fg-list" style={{ display: 'grid', gap: 12 }}>
            <div className="fg">
              <label className="fl">Branch Name</label>
              <input className="f-in" placeholder="eg. Palava Branch" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="fg">
                <label className="fl">City</label>
                <input className="f-in" placeholder="eg. Dombivli" value={data.city} onChange={e => setData({...data, city: e.target.value})} />
              </div>
              <div className="fg">
                <label className="fl">Geofence Radius (meters)</label>
                <input className="f-in" type="number" placeholder="200" value={data.radius} onChange={e => setData({...data, radius: Number(e.target.value)})} />
              </div>
            </div>

            <div className="fg">
              <label className="fl">Full Address {fetchingAddr && <span style={{ fontSize: 9, color: 'var(--teal)', marginLeft: 8 }}>(Fetching address...)</span>}</label>
              <textarea className="f-in" style={{ height: 50, padding: 10, resize: 'none' }} placeholder="eg. Lodha Palava, Dombivli" value={data.address} onChange={e => setData({...data, address: e.target.value})} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="fg">
                <label className="fl">Latitude</label>
                <input className="f-in" type="number" step="0.000001" value={data.lat || ''} onChange={e => setData({...data, lat: Number(e.target.value)})} />
              </div>
              <div className="fg">
                <label className="fl">Longitude</label>
                <input className="f-in" type="number" step="0.000001" value={data.lng || ''} onChange={e => setData({...data, lng: Number(e.target.value)})} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
              <div className="fg">
                <label className="fl">Theme Color</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#00A884', '#D97706', '#2563EB', '#7C3AED', '#E53E3E'].map(c => (
                    <div key={c} onClick={() => setData({...data, color: c})} style={{ width: 28, height: 28, borderRadius: 6, background: c, cursor: 'pointer', border: data.color === c ? '2.5px solid var(--t1)' : 'none', transition: 'all 0.2s' }} />
                  ))}
                </div>
              </div>
              <button 
                className="btn btn-sm" 
                style={{ 
                  height: 32, 
                  width: 'fit-content',
                  padding: '0 12px',
                  background: 'var(--s2)', 
                  border: '1px solid var(--br)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--t1)',
                  borderRadius: 8
                }} 
                onClick={getCurrentLocation}
              >
                <Icon n="location" size={14} color="var(--teal)" /> Current Location
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--s1)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--br)', position: 'relative', height: 260 }}>
            <BranchMap 
              lat={data.lat} 
              lng={data.lng} 
              radius={data.radius} 
              color={data.color} 
              onLocationChange={handleLocationChange}
            />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn bs btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-full" style={{ background: accentColor, color: '#fff' }} onClick={handleSave} disabled={loading}>
            {loading ? (editData ? 'Updating...' : 'Creating...') : (editData ? 'Update Branch' : 'Create Branch')}
          </button>
        </div>
      </div>
      <style jsx global>{`
        .leaflet-container { z-index: 1 !important; }
      `}</style>
    </div>
  );
};

export default AddBranchModal;
