
import React from 'react';
import { AC } from '../../lib/constants';

const Av = ({ name, size = 32, r = 8 }) => {
  const initial = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  const color = AC[(name?.charCodeAt(0) || 0) % AC.length];
  const color2 = AC[((name?.charCodeAt(0) || 0) + 2) % AC.length];
  
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: r,
      background: `linear-gradient(135deg, ${color}, ${color2})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.4,
      fontWeight: 800,
      color: '#fff',
      flexShrink: 0,
      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
    }}>
      {initial}
    </div>
  );
};

export default Av;
