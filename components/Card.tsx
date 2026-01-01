
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', footer }) => {
  return (
    <div className={`bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        </div>
      )}
      <div className="px-6 py-5">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-slate-800/20 border-t border-slate-700/50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
