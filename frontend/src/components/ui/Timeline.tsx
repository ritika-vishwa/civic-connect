import React from 'react';
import { motion } from 'framer-motion';
import { HistoryEvent } from '../../context/IssueContext';

interface TimelineProps {
  events: HistoryEvent[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="relative pl-6 border-l-2 border-primary-container/20 flex flex-col gap-6 ml-4 py-2"
    >
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;

        return (
          <motion.div 
            key={event.id || idx} 
            variants={itemVariants}
            className="relative"
          >
            {/* Timeline Node */}
            <span className="absolute -left-[31px] top-1 flex h-4 w-4">
              {isLast && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-4 w-4 border-2 border-surface ${
                isLast 
                  ? 'bg-primary-container shadow-[0_0_10px_#00f0ff]' 
                  : 'bg-white/40'
              }`}></span>
            </span>

            {/* Event Content */}
            <div className="flex flex-col">
              <div className="flex justify-between items-start gap-4">
                <h5 className="font-bold text-white text-sm uppercase tracking-wider">{event.title}</h5>
                <span className="text-[10px] font-mono text-primary-container/80 bg-primary-container/5 px-2 py-0.5 rounded border border-primary-container/10">
                  {new Date(event.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-xs text-white/70 mt-1 font-light leading-relaxed">
                {event.text}
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
export default Timeline;
