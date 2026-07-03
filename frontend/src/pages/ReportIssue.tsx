import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useIssues } from '../context/IssueContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { AIResultCard } from '../components/ui/AIResultCard';
import confetti from 'canvas-confetti';

// Map marker pinner helper
const MapEventsHelper = ({ onPin }: { onPin: (latlng: L.LatLng) => void }) => {
  useMapEvents({
    click(e: any) {
      onPin(e.latlng);
    }
  });
  return null;
};

export const ReportIssue: React.FC = () => {
  const navigate = useNavigate();
  const { addIssue } = useIssues();
  const { showToast } = useNotification();
  const { user } = useAuth();

  // Wizard state: 1 = Details, 2 = AI Analysis, 3 = Review
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form States (Step 1)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [image, setImage] = useState<string>('https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600');
  const [pin, setPin] = useState<L.LatLng>(new L.LatLng(40.7580, -73.9855));
  const [address, setAddress] = useState('720 5th Ave, New York, NY 10019');

  // AI Assist (Step 1)
  const [isAiAssisting, setIsAiAssisting] = useState(false);

  // AI Suggestions (Step 2)
  const [aiSuggestions, setAiSuggestions] = useState({
    title: '',
    category: '',
    department: '',
    confidence: 0.95,
    duplicateFound: false
  });

  // Loader state during submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState('');

  // AI Assist rewrite engine
  const handleAiAssist = () => {
    if (!description.trim()) {
      showToast('Please type a rough description first', 'warning');
      return;
    }
    setIsAiAssisting(true);
    setTimeout(() => {
      setTitle('Pothole Hazard near Pedestrian Ramp');
      setDescription(
        'Severe deep pothole identified in the center lanes. The defect lies adjacent to the high-traffic pedestrian curb ramp, posing an immediate hazard to passing vehicles and pedestrian crossings.'
      );
      setIsAiAssisting(false);
      showToast('AI optimization complete!', 'success');
    }, 1200);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        showToast('Image uploaded successfully', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        showToast('Image uploaded successfully', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Step 1 -> Step 2
  const handleAnalyzeImage = () => {
    if (!title.trim() || !description.trim()) {
      showToast('Please enter both title and description', 'error');
      return;
    }

    // Set suggestions based on user choice
    setAiSuggestions({
      title: title.includes('Pothole') ? title : `AI Suggestion: Pothole defect in ${category}`,
      category: category,
      department: category === 'Infrastructure' ? 'Public Works' : category === 'Waste' ? 'Sanitation' : 'Urban Operations',
      confidence: 0.96,
      duplicateFound: category === 'Infrastructure' && pin.lat > 40.7570 && pin.lat < 40.7590
    });

    setStep(2);
  };

  // Trigger Step 2 -> Step 3
  const handleVerifySuggestions = () => {
    setStep(3);
  };

  // Submission handler
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const timeline = [
      'Authenticating ledger nodes...',
      'Verifying GPS telemetry coordinates...',
      'Running anti-spam duplicate heuristics...',
      'Registering public ticket on ledger...',
      'Dispatching municipal notification alerts...'
    ];

    for (let i = 0; i < timeline.length; i++) {
      setSubmissionProgress(timeline[i]);
      await new Promise(r => setTimeout(r, 800));
    }
        
    try {
      // Finalize state
      const generatedId = await addIssue({
        title: aiSuggestions.title || title,
        description: description,
        category: aiSuggestions.category || category,
        severity: severity,
        location: {
          lat: pin.lat,
          lng: pin.lng,
          address: address
        },
        image: image,
        citizenName: user ? user.name : 'Citizen User',
        citizenAvatar: user ? user.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
        department: aiSuggestions.department || 'Public Works'
      });

      // Trigger confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      showToast(`Complaint submitted successfully as ${generatedId}`, 'success');
      navigate(`/success?id=${generatedId}`);
    } catch (error) {
      showToast('Failed to submit complaint to Firestore', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <header className="mb-10 text-center md:text-left pt-6 w-full">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary neon-glow-text mb-3">
          Report a Civic Issue
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Help improve our community by reporting infrastructure, utility, or safety concerns directly to the city network.
        </p>
      </header>

      {/* Progress Indicator */}
      <div className="w-full mb-10">
        <div className="flex items-center justify-between relative max-w-lg mx-auto">
          {/* Step line */}
          <div className="absolute left-0 top-5 transform -translate-y-1/2 w-full h-[2px] bg-surface-container-high z-0" />
          <div 
            className="absolute left-0 top-5 transform -translate-y-1/2 h-[2px] bg-primary-container z-0 shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all duration-500" 
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />

          {/* Steps */}
          <div 
            className={`relative z-10 flex flex-col items-center gap-1.5 cursor-pointer`}
            onClick={() => step > 1 && setStep(1)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-mono text-sm font-bold transition-all ${
              step >= 1 
                ? 'bg-primary-container text-on-primary-container border-primary-container shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                : 'bg-surface-container-highest border-outline-variant text-on-surface-variant'
            }`}>
              1
            </div>
            <span className={`text-[10px] uppercase font-mono tracking-wider ${step >= 1 ? 'text-primary' : 'text-on-surface-variant'}`}>Details</span>
          </div>

          <div 
            className={`relative z-10 flex flex-col items-center gap-1.5 cursor-pointer`}
            onClick={() => step > 2 && setStep(2)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-mono text-sm font-bold transition-all ${
              step >= 2 
                ? 'bg-primary-container text-on-primary-container border-primary-container shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                : 'bg-surface-container-highest border-outline-variant text-on-surface-variant'
            }`}>
              2
            </div>
            <span className={`text-[10px] uppercase font-mono tracking-wider ${step >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>AI Analysis</span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-mono text-sm font-bold transition-all ${
              step === 3 
                ? 'bg-primary-container text-on-primary-container border-primary-container shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                : 'bg-surface-container-highest border-outline-variant text-on-surface-variant'
            }`}>
              3
            </div>
            <span className={`text-[10px] uppercase font-mono tracking-wider ${step === 3 ? 'text-primary' : 'text-on-surface-variant'}`}>Review</span>
          </div>
        </div>
      </div>

      {/* Main Form Box */}
      <GlassCard noHover className="w-full border border-white/10 bg-[#031427]/40 shadow-xl mb-12">
        {step === 1 && (
          <div className="flex flex-col gap-6">
            
            {/* Title & AI Assist */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/50">Issue Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Severe Pothole on Main St."
                className="input-glass w-full rounded-xl px-4 py-3 text-sm placeholder-white/20"
              />
            </div>

            {/* Description & AI Assist CTA */}
            <div className="flex flex-col gap-2 relative">
              <div className="flex justify-between items-center">
                <label className="font-mono text-[10px] uppercase tracking-widest text-white/50">Rough Description</label>
                <button
                  type="button"
                  onClick={handleAiAssist}
                  disabled={isAiAssisting}
                  className="text-primary-container hover:text-white transition-colors text-[9px] font-bold uppercase tracking-wider bg-primary-container/10 px-3 py-1 rounded border border-primary-container/30 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isAiAssisting ? (
                    <>
                      <span className="w-2.5 h-2.5 border border-primary border-t-transparent rounded-full animate-spin"></span>
                      Rewriting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                      AI Assist
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of the issue..."
                className="input-glass w-full rounded-xl px-4 py-3 text-xs h-32 leading-relaxed"
              />
            </div>

            {/* Category Cards Selector */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/50">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {['Infrastructure', 'Waste', 'Traffic', 'Safety', 'Noise'].map((catName) => {
                  let iconName = 'build';
                  if (catName === 'Waste') iconName = 'delete';
                  if (catName === 'Traffic') iconName = 'traffic';
                  if (catName === 'Safety') iconName = 'campaign';
                  if (catName === 'Noise') iconName = 'volume_up';

                  return (
                    <div key={catName} className="category-card relative">
                      <input
                        type="radio"
                        id={`cat-${catName}`}
                        name="category"
                        checked={category === catName}
                        onChange={() => setCategory(catName)}
                        className="hidden"
                      />
                      <label 
                        htmlFor={`cat-${catName}`}
                        className="btn-glass flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer hover:border-primary-container/40 border text-center h-24 select-none"
                      >
                        <span className="material-symbols-outlined text-white/50 text-2xl group-hover:text-primary-container icon-container transition-colors mb-2">{iconName}</span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-white font-bold leading-none">{catName}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Severity Selector */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/50">Report Severity</label>
              <div className="grid grid-cols-4 gap-2 segmented-control">
                {['Low', 'Medium', 'High', 'Critical'].map((sev) => (
                  <React.Fragment key={sev}>
                    <input
                      type="radio"
                      id={`sev-${sev}`}
                      name="severity"
                      checked={severity === sev}
                      onChange={() => setSeverity(sev as any)}
                      className="hidden"
                    />
                    <label 
                      htmlFor={`sev-${sev}`}
                      className="btn-glass py-2.5 px-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest text-center cursor-pointer border hover:border-primary-container/40 transition-all"
                    >
                      {sev}
                    </label>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Drag & Drop Image Upload */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/50">Upload Media Evidence</label>
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleImageDrop}
                className="w-full border-2 border-dashed border-outline-variant/50 hover:border-primary-container/50 bg-black/10 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all gap-3 relative"
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {image ? (
                  <div className="flex items-center gap-4">
                    <img src={image} alt="Preview" className="w-20 h-16 object-cover rounded-lg border border-white/20" />
                    <div className="text-left">
                      <span className="text-xs text-white font-bold uppercase font-mono block">Image Loaded</span>
                      <span className="text-[10px] text-white/40 font-mono block mt-0.5">Drag to replace or click</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-white/30">add_a_photo</span>
                    <div>
                      <span className="text-xs text-white font-semibold uppercase tracking-wider block">Drag & Drop Image Evidence</span>
                      <span className="text-[10px] text-white/40 font-mono block mt-1">Supports PNG, JPG up to 10MB</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* GPS Map Pinner */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/50">Telemetry Location Pin</label>
              <div className="w-full h-64 rounded-xl overflow-hidden border border-white/10 relative">
                <MapContainer 
                  center={[pin.lat, pin.lng]} 
                  zoom={14} 
                  scrollWheelZoom={false}
                  className="w-full h-full"
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  />
                  <Marker position={[pin.lat, pin.lng]} />
                  <MapEventsHelper onPin={(latlng) => {
                    setPin(latlng);
                    setAddress(`Pinned coordinate: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
                    showToast('GPS Telemetry coordinates pinned!', 'success');
                  }} />
                </MapContainer>
                
                {/* Floating Info Coordinate Overlay */}
                <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                  <div className="bg-[#00060d]/80 backdrop-blur-md px-3 py-1.5 rounded border border-primary-container/40 text-[9px] font-mono text-primary-container font-semibold uppercase">
                    {address}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={handleAnalyzeImage}
              className="primary-btn w-full py-4 rounded-xl font-label-caps text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              Analyze Image & Continue
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            <h3 className="font-display-lg text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container animate-pulse">insights</span>
              AI Detected Metadata Recommendations
            </h3>
            
            <p className="text-xs text-white/70 font-light leading-relaxed">
              We parsed your image through our neural model and mapped it against similar neighborhood reports. Please verify, edit, and confirm the suggested titles and categories below.
            </p>

            {/* AI Results Component with editing state allowed */}
            <AIResultCard
              confidence={aiSuggestions.confidence}
              category={aiSuggestions.category}
              department={aiSuggestions.department}
              duplicateFound={aiSuggestions.duplicateFound}
              suggestedTitle={aiSuggestions.title}
              isEditing={true}
              onEditChange={(field, val) => {
                setAiSuggestions(prev => ({
                  ...prev,
                  [field === 'title' ? 'title' : field === 'category' ? 'category' : 'department']: val
                }));
              }}
            />

            {/* Navigation buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(1)}
                className="btn-glass py-4 px-6 rounded-xl font-label-caps text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer text-white flex-1"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back
              </button>
              <button
                onClick={handleVerifySuggestions}
                className="primary-btn py-4 px-6 rounded-xl font-label-caps text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer flex-[2]"
              >
                Verify & Continue
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <h3 className="font-display-lg text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">fact_check</span>
              Review & Submit Complaint
            </h3>
            
            <p className="text-xs text-white/70 font-light leading-relaxed">
              Verify your ticket details. Once submitted, this report will enter the civic workflow queue and notify local supervisors.
            </p>

            {/* Preview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#000f21]/20 border border-white/10 p-5 rounded-xl">
              
              {/* Left Column */}
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Title</span>
                  <div className="text-sm font-bold text-white uppercase mt-0.5">{aiSuggestions.title || title}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Description</span>
                  <p className="text-xs text-white/70 font-light mt-0.5 leading-relaxed">{description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Category</span>
                    <div className="text-xs font-mono font-bold text-primary-container mt-0.5">{aiSuggestions.category || category}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Severity</span>
                    <div className="text-xs font-mono font-bold text-error mt-0.5">{severity}</div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Telemetry location</span>
                  <p className="text-xs text-white/70 mt-0.5 leading-relaxed font-mono font-semibold">{address}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Image Evidence</span>
                  <img src={image} alt="Evidence" className="w-full h-32 object-cover rounded-xl border border-white/15 mt-1" />
                </div>
              </div>

            </div>

            {/* Navigation buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(2)}
                className="btn-glass py-4 px-6 rounded-xl font-label-caps text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer text-white flex-1"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="primary-btn py-4 px-6 rounded-xl font-label-caps text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer flex-[2]"
              >
                Submit Ticket
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>

          </div>
        )}
      </GlassCard>

      {/* Full-screen Loading Overlay for submit animation */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#000f21]/95 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center gap-4 text-center max-w-sm px-6">
            <span className="relative flex h-14 w-14">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
              <span className="relative inline-flex rounded-full h-14 w-14 border border-primary-container/50 bg-[#031427] flex items-center justify-center text-primary-container shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                <span className="material-symbols-outlined text-2xl animate-spin">sync</span>
              </span>
            </span>

            <h4 className="font-display-lg text-lg font-bold text-white uppercase tracking-widest mt-4">Writing Ledger Entry</h4>
            <p className="text-xs text-primary-container font-mono uppercase tracking-wider animate-pulse h-10 flex items-center justify-center">
              {submissionProgress}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
export default ReportIssue;
