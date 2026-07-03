import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { useNotification } from '../context/NotificationContext';
import { collection, onSnapshot, query, doc, updateDoc, arrayUnion, arrayRemove, addDoc, orderBy } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';

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
  registeredBy: string[];
  image: string;
}

export const Events: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [rawEvents, setRawEvents] = useState<any[]>([]);
  
  // Create Event Form State
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EventItem['category']>('Town Hall');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { showToast } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRawEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching events:", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const mappedEvents = rawEvents.map(evt => {
      const registeredArray = evt.registeredBy || [];
      const isReg = user ? registeredArray.includes(user.uid) : false;
      return {
        ...evt,
        registeredBy: registeredArray,
        isRegistered: isReg,
        attendeesCount: registeredArray.length > 0 ? registeredArray.length : (evt.attendeesCount || 0)
      } as EventItem;
    });
    setEvents(mappedEvents);
  }, [rawEvents, user]);

  const handleRegister = async (id: string) => {
    if (!user) {
      showToast('You must be logged in to register.', 'warning');
      return;
    }
    const evt = events.find(e => e.id === id);
    if (!evt) return;

    const registered = evt.isRegistered;
    const eventRef = doc(db, 'events', id);

    try {
      if (registered) {
        await updateDoc(eventRef, { registeredBy: arrayRemove(user.uid) });
        showToast(`Cancelled registration for: ${evt.title}`, 'info');
      } else {
        await updateDoc(eventRef, { registeredBy: arrayUnion(user.uid) });
        showToast(`Registered for event: ${evt.title}`, 'success');
      }
    } catch (error) {
      console.error("Failed to register for event:", error);
      showToast('Failed to update registration status', 'error');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newDate || !newTime || !newLocation) {
      showToast('Please fill all fields', 'warning');
      return;
    }

    try {
      let finalImageUrl = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'; // Default event image
      if (imagePreview) {
        const imageRef = ref(storage, `events/${Date.now()}`);
        const uploadPromise = uploadString(imageRef, imagePreview, 'data_url').then(() => getDownloadURL(imageRef));
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Storage timeout")), 4000));
        try {
          finalImageUrl = await Promise.race([uploadPromise, timeoutPromise]) as string;
        } catch (storageErr) {
          console.warn("Storage upload failed, falling back to dummy image.", storageErr);
        }
      }

      await addDoc(collection(db, 'events'), {
        title: newTitle,
        category: newCategory,
        description: newDesc,
        date: newDate,
        time: newTime,
        location: newLocation,
        image: finalImageUrl,
        registeredBy: [],
        attendeesCount: 0,
        createdAt: new Date().toISOString()
      });

      setNewTitle('');
      setNewDesc('');
      setNewDate('');
      setNewTime('');
      setNewLocation('');
      setImagePreview(null);
      setShowForm(false);
      showToast('Event created successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to create event', 'error');
    }
  };

  const generateICS = (evt: EventItem) => {
    const d = new Date(evt.date);
    // Rough 2 hour duration assumption
    const startStr = d.toISOString().replace(/-|:|\.\d+/g, '').substring(0,15) + 'Z';
    const endStr = new Date(d.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, '').substring(0,15) + 'Z';
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${evt.title}
DTSTART:${startStr}
DTEND:${endStr}
LOCATION:${evt.location}
DESCRIPTION:${evt.description}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${evt.title.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        
        {user && (user.role === 'admin' || user.role === 'official') && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="primary-btn rounded-xl py-3 px-5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">event_add</span>
            {showForm ? 'Close Editor' : 'Create Event'}
          </button>
        )}
      </div>

      {/* Create Event Form */}
      {showForm && (
        <div className="animate-fade-in-up">
          <GlassCard noHover className="p-6 border border-primary-container/40">
            <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
              <h3 className="font-display-lg text-lg font-bold text-white uppercase tracking-tight">Schedule New Event</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Event Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input-glass px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider"
                  required
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="input-glass px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider appearance-none"
                >
                  <option value="Town Hall">Town Hall</option>
                  <option value="Volunteering">Volunteering</option>
                  <option value="Environment">Environment</option>
                  <option value="Policy">Policy</option>
                </select>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="input-glass px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider"
                  required
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="input-glass px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider"
                  required
                />
                <input
                  type="text"
                  placeholder="Location (e.g. Sector 3 Park)"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="input-glass px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider md:col-span-2"
                  required
                />
                <textarea
                  placeholder="Event description and details..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="input-glass px-4 py-2.5 rounded-xl text-xs h-24 leading-relaxed md:col-span-2"
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="flex items-center gap-4 mt-2">
                <label className="cursor-pointer flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest border border-white/10 px-4 py-2 rounded-xl bg-black/20">
                  <span className="material-symbols-outlined text-[18px]">image</span>
                  {imagePreview ? 'Change Image' : 'Attach Cover Image'}
                  <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                </label>
                {imagePreview && (
                  <div className="relative w-16 h-12 rounded overflow-hidden border border-primary-container/30">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-0 right-0 bg-black/50 text-white p-0.5"
                    >
                      <span className="material-symbols-outlined text-[10px]">close</span>
                    </button>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                className="btn-gradient-cyan self-end px-5 py-2.5 mt-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
              >
                <span className="material-symbols-outlined text-[18px]">event_available</span>
                Publish Event
              </button>
            </form>
          </GlassCard>
        </div>
      )}

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

                    <div className="flex gap-2">
                      <button
                        onClick={() => generateICS(evt)}
                        title="Add to Calendar"
                        className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                      </button>
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
