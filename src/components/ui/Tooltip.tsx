'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ content, children, position = 'top', delay = 300 }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
    
    timeoutRef.current = setTimeout(() => {
      setShow(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShow(false);
  };

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      pointerEvents: 'none' as const,
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          left: `${coords.x}px`,
          top: `${coords.y - 8}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          ...baseStyles,
          left: `${coords.x}px`,
          top: `${coords.y + 8}px`,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          ...baseStyles,
          left: `${coords.x - 8}px`,
          top: `${coords.y}px`,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          ...baseStyles,
          left: `${coords.x + 8}px`,
          top: `${coords.y}px`,
          transform: 'translate(0, -50%)',
        };
      default:
        return baseStyles;
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      {show && (
        <div
          style={getPositionStyles()}
          className="px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg max-w-xs whitespace-nowrap animate-in fade-in duration-200"
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' :
              position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' :
              position === 'left' ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2' :
              'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </>
  );
}

interface HelpTextProps {
  children: React.ReactNode;
  className?: string;
}

export function HelpText({ children, className = '' }: HelpTextProps) {
  return (
    <p className={`text-sm text-gray-600 mt-1 ${className}`}>
      {children}
    </p>
  );
}

interface InfoIconProps {
  tooltip: string;
  className?: string;
}

export function InfoIcon({ tooltip, className = '' }: InfoIconProps) {
  return (
    <Tooltip content={tooltip}>
      <svg
        className={`w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help inline-block ${className}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </Tooltip>
  );
}
