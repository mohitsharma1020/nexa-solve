'use client';
import { useState, useEffect } from 'react';

const styles = {
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
  },
  block: {
    background: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '90px',
  },
  value: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1,
    marginBottom: '6px',
    letterSpacing: '-0.02em',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
};

export default function CountdownTimer() {
  const [time, setTime] = useState({ hours: 23, minutes: 45, seconds: 30 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div style={styles.wrapper}>
      <div style={styles.block}>
        <span style={styles.value}>{pad(time.hours)}</span>
        <span style={styles.label}>Hours</span>
      </div>
      <div style={styles.block}>
        <span style={styles.value}>{pad(time.minutes)}</span>
        <span style={styles.label}>Minutes</span>
      </div>
      <div style={styles.block}>
        <span style={styles.value}>{pad(time.seconds)}</span>
        <span style={styles.label}>Seconds</span>
      </div>
    </div>
  );
}
