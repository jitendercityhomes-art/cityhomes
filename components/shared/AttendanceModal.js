
import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { API_BASE } from '../../lib/constants';
import { useAppContext } from '../../context/AppContext';

const AttendanceModal = ({ onClose, userName, geoSettings, currentStatus: initialStatus, branchId, onSuccess }) => {
  const { triggerRefresh } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState(initialStatus || 'out');
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [address, setAddress] = useState('Detecting...');
  const [selfie, setSelfie] = useState(null);
  const [selfieTime, setSelfieTime] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastLocationRef = useRef(null);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Fetch latest status on mount to be absolutely sure
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/attendance/today?_t=${Date.now()}`, { credentials: 'include' });
        if (res.ok) {
          const status = await res.json();
          if (status.hasPunchedIn && status.hasPunchedOut) {
            setCurrentStatus('completed');
          } else if (status.hasPunchedIn) {
            setCurrentStatus('in');
          } else {
            setCurrentStatus('out');
          }
        }
      } catch (e) {
        console.error('Error fetching modal status:', e);
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    if (currentStatus === 'completed') {
      setMsg('Attendance for today is already completed!');
      setTimeout(() => onClose(), 2500);
    }
  }, [currentStatus, onClose]);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Location Tracking
  useEffect(() => {
    if (currentStatus === 'completed') return;
    const handlePos = pos => {
      const { latitude, longitude, accuracy } = pos.coords;
      lastLocationRef.current = pos.coords;
      setLocation({ lat: latitude, lng: longitude });
      const dist = getDistance(latitude, longitude, geoSettings.lat, geoSettings.lng);
      setDistance(Math.round(dist));
      setAddress(dist <= geoSettings.radius ? geoSettings.address : 'Outside allowed area');
    };

    if (navigator.geolocation) {
      // 1. Quick initial check
      navigator.geolocation.getCurrentPosition(handlePos, null, { 
        enableHighAccuracy: true, 
        timeout: 5000, 
        maximumAge: 0 
      });

      // 2. Continuous tracking
      watchIdRef.current = navigator.geolocation.watchPosition(handlePos,
        err => setError('Location access denied'),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation not supported');
    }
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [geoSettings, currentStatus]);

  // Camera setup
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera to mark attendance.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      // Optimize for speed: use smaller dimensions for attendance photo (320x320)
      const SIZE = 320;
      canvasRef.current.width = SIZE;
      canvasRef.current.height = SIZE;
      
      // Calculate crop for centered 1:1 image
      const vw = videoRef.current.videoWidth;
      const vh = videoRef.current.videoHeight;
      const min = Math.min(vw, vh);
      const sx = (vw - min) / 2;
      const sy = (vh - min) / 2;

      context.drawImage(videoRef.current, sx, sy, min, min, 0, 0, SIZE, SIZE);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.6); // Quality 0.6 is plenty for attendance
      setSelfie(dataUrl);
      setSelfieTime(Date.now());
      stopCamera();
      setCameraActive(false);
    }
  };

  const retakeSelfie = () => {
    setSelfie(null);
    setSelfieTime(null);
    startCamera();
  };

  const addressLabel = (geoSettings?.address || 'site').split(',')[0] || 'site';

  const handleAction = async () => {
    if (!selfie) {
      alert('Please take a selfie first');
      return;
    }

    // CHECK: Selfie expiry (e.g. 3 minutes max)
    const timeDiff = (Date.now() - selfieTime) / 1000;
    if (timeDiff > 180) { // 3 minutes
      alert('Selfie expired! Please take a fresh photo to confirm you are still here.');
      retakeSelfie();
      return;
    }

    // FINAL VALIDATION: Re-check location at the moment of clicking
    setLoading(true);
    
    const proceedWithUpload = async (lat, lng, acc) => {
      const finalDist = getDistance(lat, lng, geoSettings.lat, geoSettings.lng);
      
      if (finalDist > geoSettings.radius) {
        setLoading(false);
        setDistance(Math.round(finalDist));
        setMsg(`FAILED: You are ${Math.round(finalDist)}m away. Move closer!`);
        setTimeout(() => setMsg(null), 5000);
        return;
      }

      if (acc > 150) {
        setLoading(false);
        setMsg('GPS signal weak. Move to an open area.');
        setTimeout(() => setMsg(null), 5000);
        return;
      }

      const type = currentStatus === 'in' ? 'out' : 'in';
      const endpoint = type === 'in' ? 'punch-in' : 'punch-out';
      
      try {
        const res = await fetch(`${API_BASE}/attendance/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            lat: lat,
            lng: lng,
            address: address,
            branchId: Number(branchId) || 1,
            photoUrl: selfie
          })
        });

        if (res.ok) {
          const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          onSuccess(type, time, address);
          triggerRefresh();
          onClose();
        } else {
          const err = await res.json();
          setMsg(err.message || 'Action failed');
          setTimeout(() => setMsg(null), 5000);
        }
      } catch (e) {
        setMsg('Network error');
        setTimeout(() => setMsg(null), 5000);
      } finally {
        setLoading(false);
      }
    };

    // If we already have a recent accurate location (within last 30 seconds), use it immediately!
    if (lastLocationRef.current && (Date.now() - lastLocationRef.current.timestamp < 30000)) {
      const { latitude, longitude, accuracy } = lastLocationRef.current;
      await proceedWithUpload(latitude, longitude, accuracy);
    } else {
      // Otherwise fetch once more with a slightly longer timeout for reliability
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          await proceedWithUpload(latitude, longitude, accuracy);
        },
        async (err) => {
          // FALLBACK: If fresh fetch fails, but we have ANY cached location, use it as last resort
          if (lastLocationRef.current) {
            console.warn('Location fetch failed, using cached location as fallback');
            const { latitude, longitude, accuracy } = lastLocationRef.current;
            await proceedWithUpload(latitude, longitude, accuracy);
          } else {
            setLoading(false);
            setMsg('Could not verify location. Try again.');
          }
        },
        { enableHighAccuracy: true, timeout: 7000 }
      );
    }
  };

  const isLocationOk = distance !== null && distance <= geoSettings.radius;
  const canPunch = isLocationOk && selfie && !loading;
  const isPunchIn = currentStatus !== 'in';

  if (statusLoading) return (
    <div className="modal-ov">
      <div className="modal-box" style={{ maxWidth: 420, borderRadius: 28, padding: 40, textAlign: 'center' }}>
        <div className="loader" style={{ margin: '0 auto' }} />
        <div style={{ marginTop: 20, fontWeight: 700 }}>Checking Status...</div>
      </div>
    </div>
  );

  return (
    <div className="modal-ov" onClick={e => e.target === e.currentTarget && onClose()}>
      {/* If completed, ONLY show the message and hide the entire modal UI */}
      {currentStatus === 'completed' ? (
        <div style={{ 
          background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '30px 40px', borderRadius: 24,
          zIndex: 100, width: '90%', maxWidth: 350, backdropFilter: 'blur(15px)', boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          animation: 'pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', textAlign: 'center'
        }}>
          <div style={{ width: 60, height: 60, borderRadius: 30, background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Icon n="check" size={32} color="var(--grn)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>All Set!</div>
          <div style={{ fontSize: 14, fontWeight: 500, opacity: 0.9 }}>Attendance for today is already completed!</div>
          <style jsx>{`
            @keyframes pop {
              0% { transform: scale(0.8); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      ) : (
        <div className="modal-box" style={{ maxWidth: 420, borderRadius: 28, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-head" style={{ padding: '18px 24px', borderBottom: '1px solid var(--br)', background: '#fff', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div>
              <span className="modal-title" style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)' }}>
                {isPunchIn ? 'Punch In Verification' : 'Punch Out Verification'}
              </span>
              <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600, marginTop: 2 }}>{currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
            </div>
            <button className="ib" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10 }}><Icon n="x" size={16} color="var(--t2)"/></button>
          </div>
        </div>
        
        <div className="modal-body" style={{ padding: '24px', textAlign: 'center', background: '#fcfdfe', overflowY: 'auto', position: 'relative' }}>
          {/* Custom Centered Popup Message */}
          {msg && (
            <div style={{ 
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '20px 30px', borderRadius: 20,
              zIndex: 100, width: '80%', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              animation: 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
              <Icon n={msg.includes('completed') ? 'check' : 'alert'} size={32} color={msg.includes('completed') ? 'var(--grn)' : '#fff'} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 700 }}>{msg}</div>
              <style jsx>{`
                @keyframes pop {
                  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
              `}</style>
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--t1)', letterSpacing: '-0.5px' }}>
              {isPunchIn ? `Hi, ${userName.split(' ')[0]}` : `Bye, ${userName.split(' ')[0]}`}
            </div>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 6, 
              background: '#fff', padding: '6px 14px', borderRadius: 20, 
              border: '1px solid var(--br)', marginTop: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' 
            }}>
              <Icon n="clock" size={14} color={isPunchIn ? 'var(--grn)' : 'var(--red)'}/>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>{currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>

          {/* Camera Section */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#000', borderRadius: 20, overflow: 'hidden', marginBottom: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
            {!selfie ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {cameraActive && (
                  <button 
                    onClick={captureSelfie}
                    style={{ 
                      position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                      width: 64, height: 64, borderRadius: 32, background: '#fff', border: '6px solid rgba(0,0,0,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.4)', transition: 'transform 0.2s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'translateX(-50%) scale(0.9)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 22, border: '3px solid #000' }} />
                  </button>
                )}
                <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.5)', padding: '4px 10px', borderRadius: 6, color: '#fff', fontSize: 10, fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                  LIVE CAMERA
                </div>
              </>
            ) : (
              <>
                <img src={selfie} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="selfie" />
                <button 
                  onClick={retakeSelfie}
                  style={{ 
                    position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.9)', color: '#000', 
                    border: 'none', padding: '8px 16px', borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  <Icon n="refresh" size={14} color="#000"/> Retake Photo
                </button>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: '#fff', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--grn)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon n="check" size={14} color="#fff"/>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>Selfie Verified</span>
                  </div>
                </div>
              </>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          {/* Location Status */}
          <div style={{ 
            background: '#fff', borderRadius: 18, padding: '16px', marginBottom: 24, 
            border: `1.5px solid ${isLocationOk ? 'var(--grn)' : 'var(--red)'}`,
            display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{ 
              width: 44, height: 44, borderRadius: 14, 
              background: isLocationOk ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
            }}>
              <Icon n="map_pin" size="22" color={isLocationOk ? 'var(--grn)' : 'var(--red)'}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: isLocationOk ? 'var(--grn)' : 'var(--red)' }}>
                  {distance !== null ? `${distance}m from ${addressLabel}` : 'Locating...'}
                </div>
                {isLocationOk && <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--grn)', background: 'rgba(22,163,74,0.1)', padding: '2px 8px', borderRadius: 6 }}>ACCURATE</div>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2, fontWeight: 500 }}>{address}</div>
            </div>
          </div>

          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', 
              padding: '12px 16px', borderRadius: 12, fontSize: 12, fontWeight: 700, 
              marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10
            }}>
              <Icon n="alert" size={16} color="var(--red)"/> {error}
            </div>
          )}

          {/* Action Button */}
          <button 
            className={`btn btn-full`}
            style={{ 
              background: !isPunchIn ? 'var(--red)' : 'var(--grn)', 
              color: '#fff',
              height: 56,
              borderRadius: 18,
              fontSize: 16,
              fontWeight: 800,
              boxShadow: canPunch ? `0 8px 20px ${!isPunchIn ? 'rgba(239, 68, 68, 0.25)' : 'rgba(22, 163, 74, 0.25)'}` : 'none',
              opacity: canPunch ? 1 : 0.6,
              cursor: canPunch ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              border: 'none'
            }}
            disabled={!canPunch}
            onClick={handleAction}
          >
            {loading ? 'Verifying & Saving...' : 
             !isLocationOk ? `Move Inside Allowed Radius` :
             !selfie ? 'Take Selfie to Confirm' :
             isPunchIn ? 'Confirm Punch In' : 'Confirm Punch Out'}
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 15, marginTop: 20 }}>
            <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon n="shield" size={12} color="var(--t3)"/> Radius: {geoSettings?.radius ?? 0}m
            </div>
            <div style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--br)' }} />
            <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon n="image" size={12} color="var(--t3)"/> Photo ID Required
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceModal;
