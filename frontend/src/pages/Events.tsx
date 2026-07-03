import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useNotification } from '../context/NotificationContext';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface EventItem {
  id: string;
  title: string;
  category: 'Town Hall' | 'Volunteering' | 'Environment' | 'Policy';
  description: string;
  date: string;
  time: string;
  location: string;
  attendeesCount: number;
  isRegistered: boolean;
  image: string;
}

export const Events: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const { showToast } = useNotification();

  useEffect(() => {
    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEvents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EventItem[];
      setEvents(fetchedEvents);
    }, (error) => {
      console.error("Error fetching events:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleRegister = async (id: string) => {
    const evt = events.find(e => e.id === id);
    if (!evt) return;

    const registered = !evt.isRegistered;
    const newCount = evt.attendeesCount + (registered ? 1 : -1);

    try {
      const eventRef = doc(db, 'events', id);
      await updateDoc(eventRef, {
        isRegistered: registered,
        attendeesCount: newCount
      });
      
      showToast(
        registered 
          ? `Registered for event: ${evt.title}` 
          : `Cancelled registration for: ${evt.title}`,
        registered ? 'success' : 'info'
      );
    } catch (error) {
      console.error("Failed to register for event:", error);
      showToast('Failed to update registration status', 'error');
    }
  };

  const getCategoryColor = (cat: EventItem['category']) => {
    switch (cat) {
      case 'Town Hall': return 'bg-cyan-500/10 text-[#00f0ff] border-cyan-500/20';
      case 'Volunteering': return 'bg-green-500/10 text-green-300 border-green-500/20';
      case 'Environment': return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'Policy': return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 animate-fade-in-up">
        <div>
          <h1 className="font-display-lg text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Local Events
          </h1>
          <p className="text-primary-container/80 font-mono text-sm mt-2 uppercase tracking-widest">
            Register and engage in local forums, workshops, and civic campaigns.
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {events.map((evt, idx) => {
          const eventDate = new Date(evt.date);
          const day = eventDate.getDate();
          const month = eventDate.toLocaleString(undefined, { month: 'short' }).toUpperCase();

          return (
            <div key={evt.id} className="animate-fade-in-up" style={{ animationDelay: `${(idx + 1) * 0.1}s` }}>
              <GlassCard noHover className="flex flex-col h-full border border-white/10 overflow-hidden relative group">
                
                {/* Header Image */}
                <div className="h-44 w-full overflow-hidden bg-surface-container-lowest border-b border-white/10 relative">
                  <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
                  
                  {/* Category chip */}
                  <span className={`absolute top-4 left-4 border text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md ${getCategoryColor(evt.category)}`}>
                    {evt.category}
                  </span>

                  {/* Calendar Block (Overlay) */}
                  <div className="absolute top-4 right-4 bg-[#031427]/90 border border-primary-container/40 rounded-lg p-2 text-center min-w-[50px] shadow-lg">
                    <span className="block font-display-lg text-lg font-black text-white leading-none">{day}</span>
                    <span className="block font-mono text-[8px] text-primary-container font-bold mt-1 tracking-wider">{month}</span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white uppercase tracking-tight leading-tight group-hover:text-primary-container transition-colors">
                      {evt.title}
                    </h4>
                    <p className="text-[10px] font-mono text-white/50 mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">schedule</span> {evt.time}
                    </p>
                    <p className="text-[10px] font-mono text-white/50 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">location_on</span> {evt.location}
                    </p>
                    <p className="text-xs text-white/70 mt-3 font-light leading-relaxed line-clamp-3">
                      {evt.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/40 uppercase">
                      {evt.attendeesCount} ATTENDING
                    </span>

                    <button
                      onClick={() => handleRegister(evt.id)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                        evt.isRegistered
                          ? 'bg-primary-container/10 border-primary-container/40 text-primary-container shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                          : 'btn-glass text-white'
                      }`}
                    >
                      {evt.isRegistered ? 'REGISTERED' : 'REGISTER'}
                    </button>
                  </div>
                </div>

              </GlassCard>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Events;
