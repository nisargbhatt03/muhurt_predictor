import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface VedicDatePickerProps {
  label?: string;
  value: string; // ISO format "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  minDate?: string;
  maxDate?: string;
  alignRight?: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const VedicDatePicker: React.FC<VedicDatePickerProps> = ({
  label,
  value,
  onChange,
  alignRight = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse input value to Date object safely
  const parsedDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Close calendar popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Calendar calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const selectedIso = `${viewYear}-${mStr}-${dStr}`;
    onChange(selectedIso);
    setIsOpen(false);
  };

  const handlePreset = (type: 'today' | 'tomorrow' | '5days' | '3months' | '1year') => {
    const today = new Date();
    let target = new Date();
    
    if (type === 'today') {
      target = today;
    } else if (type === 'tomorrow') {
      target.setDate(today.getDate() + 1);
    } else if (type === '5days') {
      target.setDate(today.getDate() + 5);
    } else if (type === '3months') {
      target.setMonth(today.getMonth() + 3);
    } else if (type === '1year') {
      target.setFullYear(today.getFullYear() + 1);
    }

    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;
    onChange(iso);
    setViewYear(y);
    setViewMonth(target.getMonth());
    setIsOpen(false);
  };

  // Formatted date string for button display
  const formatDisplayDate = (isoStr: string) => {
    if (!isoStr) return "Select Date";
    const d = new Date(isoStr + 'T00:00:00');
    if (isNaN(d.getTime())) return isoStr;
    const dayNum = d.getDate();
    const mName = MONTH_NAMES[d.getMonth()].substring(0, 3);
    const yearNum = d.getFullYear();
    const dayName = DAY_NAMES[d.getDay()];
    return `${dayNum} ${mName} ${yearNum} (${dayName})`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={containerRef}>
      {label && (
        <label className="input-label" style={{ marginBottom: '6px', textAlign: 'left', justifyContent: 'flex-start' }}>
          <CalendarIcon size={15} color="var(--gold-primary)" style={{ marginRight: '6px' }} />
          {label}
        </label>
      )}

      {/* Trigger Card */}
      <button
        type="button"
        className={`text-input-field ${isOpen ? 'active-picker-btn' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          padding: '12px 16px',
          borderColor: isOpen ? 'var(--gold-primary)' : undefined,
          boxShadow: isOpen ? '0 0 12px var(--gold-glow)' : undefined,
          width: '100%',
          textAlign: 'left'
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
          {formatDisplayDate(value)}
        </span>
        <CalendarIcon size={18} color="var(--gold-primary)" />
      </button>

      {/* Custom Vedic Cosmic Calendar Popover */}
      {isOpen && (
        <div
          className="vedic-calendar-popover animated fadeIn"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: alignRight ? 'auto' : 0,
            right: alignRight ? 0 : 'auto',
            zIndex: 300,
            width: '290px',
            background: 'var(--bg-dark)',
            border: '1px solid var(--gold-primary)',
            borderRadius: '16px',
            padding: '14px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.85), 0 0 25px rgba(255, 215, 0, 0.2)',
            backdropFilter: 'blur(16px)'
          }}
        >
          {/* Header Month / Year controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '10px',
              borderBottom: '1px solid rgba(255, 215, 0, 0.15)'
            }}
          >
            <button
              type="button"
              className="icon-action-btn"
              onClick={handlePrevMonth}
              style={{ width: '32px', height: '32px' }}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <div
              style={{
                fontFamily: 'var(--heading-font)',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: 'var(--gold-primary)',
                letterSpacing: '0.5px'
              }}
            >
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>

            <button
              type="button"
              className="icon-action-btn"
              onClick={handleNextMonth}
              style={{ width: '32px', height: '32px' }}
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Names */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
              textAlign: 'center',
              marginBottom: '6px'
            }}
          >
            {DAY_NAMES.map((d, idx) => (
              <span
                key={d}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: idx === 1 || idx === 3 || idx === 4 || idx === 5 ? 'var(--gold-primary)' : 'var(--text-secondary)'
                }}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '3px'
            }}
          >
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const mStr = String(viewMonth + 1).padStart(2, '0');
              const dStr = String(day).padStart(2, '0');
              const cellIso = `${viewYear}-${mStr}-${dStr}`;

              const isSelected = cellIso === value;
              const isToday = cellIso === todayStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  style={{
                    height: '34px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid var(--gold-primary)' : isToday ? '1px solid rgba(255, 215, 0, 0.4)' : 'none',
                    background: isSelected
                      ? 'linear-gradient(135deg, var(--gold-secondary) 0%, var(--gold-primary) 100%)'
                      : isToday
                      ? 'rgba(255, 215, 0, 0.12)'
                      : 'transparent',
                    color: isSelected ? '#ffffff' : isToday ? 'var(--gold-primary)' : 'var(--text-primary)',
                    fontWeight: isSelected || isToday ? 700 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 0 8px var(--gold-glow)' : undefined
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Vedic Preset Quick Chips */}
          <div
            style={{
              marginTop: '12px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 215, 0, 0.15)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px'
            }}
          >
            <button
              type="button"
              className="dev-btn"
              style={{ padding: '4px 6px', fontSize: '0.7rem', borderRadius: '6px' }}
              onClick={() => handlePreset('today')}
            >
              ✦ Today
            </button>
            <button
              type="button"
              className="dev-btn"
              style={{ padding: '4px 6px', fontSize: '0.7rem', borderRadius: '6px' }}
              onClick={() => handlePreset('tomorrow')}
            >
              ✦ Tomorrow
            </button>
            <button
              type="button"
              className="dev-btn"
              style={{ padding: '4px 6px', fontSize: '0.7rem', borderRadius: '6px' }}
              onClick={() => handlePreset('5days')}
            >
              ✦ +5 Days
            </button>
            <button
              type="button"
              className="dev-btn"
              style={{ padding: '4px 6px', fontSize: '0.7rem', borderRadius: '6px' }}
              onClick={() => handlePreset('3months')}
            >
              ✦ +3 Months
            </button>
            <button
              type="button"
              className="dev-btn"
              style={{ padding: '4px 6px', fontSize: '0.7rem', borderRadius: '6px' }}
              onClick={() => handlePreset('1year')}
            >
              ✦ +1 Year
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
