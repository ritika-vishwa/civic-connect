import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  noHover?: boolean;
  overflowVisible?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  noHover = false,
  overflowVisible = false,
  onClick,
  style
}) => {
  const cardClasses = `${
    noHover ? 'glass-card-no-hover' : 'glass-card'
  } rounded-2xl p-6 relative ${overflowVisible ? '' : 'overflow-hidden'} group ${onClick ? 'cursor-pointer' : ''} ${className}`;

  if (noHover) {
    return (
      <div className={cardClasses} onClick={onClick} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, borderColor: 'rgba(255, 255, 255, 0.3)', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cardClasses}
      onClick={onClick}
      style={style}
    >
      {children}
    </motion.div>
  );
};
export default GlassCard;
