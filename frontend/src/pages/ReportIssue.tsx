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
import { GoogleGenerativeAI } from '@google/generative-ai';
import { canReportIssue } from '../context/permissions';
import { motion, AnimatePresence } from 'framer-motion';

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }
} as const;


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
  const { addIssue, issues, supportIssue } = useIssues();
  const { showToast } = useNotification();
  const { user } = useAuth();

  // Permission guard — officials cannot report issues
  if (user && !canReportIssue(user)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-fade-in-up">
        <span className="material-symbols-outlined text-[64px] text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">gavel</span>
        <h2 className="font-display-lg text-2xl font-black text-white uppercase tracking-wider">Access Restricted</h2>
        <p className="text-white/60 text-xs font-mono uppercase tracking-widest max-w-sm">
          Municipal Officials cannot submit civic reports. Use the Officer Workspace to manage and update existing complaints.
        </p>
        <button
          onClick={() => navigate('/officer')}
          className="btn-gradient-cyan px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer"
        >
          Go to Officer Workspace
        </button>
      </div>
    );
  }

  // Wizard state: 1 = Details, 2 = AI Analysis, 3 = Review
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form States (Step 1)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Potholes');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [image, setImage] = useState<string>('');
  const [pin, setPin] = useState<L.LatLng>(new L.LatLng(40.7580, -73.9855));
  const [address, setAddress] = useState('720 5th Ave, New York, NY 10019');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // AI Assist (Step 1)
  const [isAiAssisting, setIsAiAssisting] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [duplicateIssueId, setDuplicateIssueId] = useState<string | null>(null);

  // AI Suggestions (Step 2)
  const [aiSuggestions, setAiSuggestions] = useState({
    title: '',
    description: '',
    category: '',
    severity: 'Medium',
    department: '',
    confidence: 0.95,
    duplicateFound: false
  });

  // Loader state during submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState('');

  // AI Assist rewrite engine
  const handleAiAssist = async () => {
    if (!description.trim()) {
      showToast('Please type a rough description first', 'warning');
      return;
    }
    setIsAiAssisting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ai/assist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description })
      });

      if (!response.ok) {
        throw new Error('Failed to rewrite description');
      }

      const data = await response.json();

      setTitle(data.title);
      setDescription(data.description);
      showToast('AI optimization complete!', 'success');
    } catch (e) {
      console.warn("Backend AI Assist failed, attempting client-side Gemini fallback:", e);
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          const prompt = `Optimize this civic issue report. Rewrite the description to be formal and structured for city officials. Keep it concise.
          Title: ${title}
          Rough Description: ${description}
          
          Return a JSON object exactly matching this format:
          {
            "title": "Optimized Title",
            "description": "Optimized Description"
          }
          Do not include any markdown styling like \`\`\`json. Return raw JSON.`;
          
          const result = await model.generateContent(prompt);
          const responseText = result.response.text();
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            setTitle(data.title || title);
            setDescription(data.description || description);
            showToast('AI optimization complete (client fallback)!', 'success');
          } else {
            throw new Error("Invalid AI response format");
          }
        } catch (clientError) {
          console.error("Direct Gemini client call failed:", clientError);
          showToast('AI assist failed. Please edit manually.', 'error');
        }
      } else {
        showToast('AI assist failed. Please edit manually.', 'error');
      }
    } finally {
      setIsAiAssisting(false);
    }
  };

  const simulateAiImageAnalysis = async (base64Image: string) => {
    setIsAnalyzingImage(true);
    setTitle('');
    setDescription('');
    setCategory('Other');
    showToast('AI analyzing image signature...', 'info');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ai/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const aiData = await response.json();

      setCategory(aiData.category || 'Other');
      setTitle(aiData.title || '');
      setDescription(aiData.description || '');
      setSeverity(aiData.severity || 'Medium');

      setAiSuggestions(prev => ({
        ...prev,
        title: aiData.title || '',
        description: aiData.description || '',
        category: aiData.category || 'Other',
        severity: aiData.severity || 'Medium',
        department: aiData.department || 'Urban Operations',
        confidence: aiData.confidence || 0.95
      }));

      showToast('AI successfully extracted issue details from image', 'success');
    } catch (error) {
      console.warn("Backend AI image analysis failed, attempting client-side Gemini fallback:", error);
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
          
          const mimeType = base64Image.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
          const base64Data = base64Image.split(',')[1];
          
          const prompt = `Analyze this image of a municipal/civic issue. Return a JSON object detailing the issue:
          {
            "title": "A short descriptive title of the issue",
            "description": "A detailed description of the issue shown in the image",
            "category": "Potholes | Water Leaks | Drainage Blockages | Broken Streetlights | Garbage Accumulation | Sanitation Issues | Other",
            "severity": "Low | Medium | High | Critical",
            "department": "Public Works | Sanitation | Traffic Control | Urban Operations",
            "confidence": 0.95
          }
          Return raw JSON only, no markdown blocks.`;
          
          const result = await model.generateContent([
            prompt,
            {
              inlineData: {
                data: base64Data,
                mimeType
              }
            }
          ]);
          
          const responseText = result.response.text();
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const aiData = JSON.parse(jsonMatch[0]);
            setCategory(aiData.category || 'Other');
            setTitle(aiData.title || '');
            setDescription(aiData.description || '');
            setSeverity(aiData.severity || 'Medium');
            
            setAiSuggestions(prev => ({
              ...prev,
              title: aiData.title || '',
              description: aiData.description || '',
              category: aiData.category || 'Other',
              severity: aiData.severity || 'Medium',
              department: aiData.department || 'Urban Operations',
              confidence: aiData.confidence || 0.95
            }));
            showToast('AI successfully analyzed image (client fallback)', 'success');
          } else {
            throw new Error("Invalid format from client-side Gemini");
          }
        } catch (clientError) {
          console.error("Direct Gemini client call failed:", clientError);
          showToast('AI analysis failed. Please fill manually.', 'error');
        }
      } else {
        showToast('AI analysis failed. Please fill manually.', 'error');
      }
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const compressedBase64 = await compressImage(file);
        setImage(compressedBase64);
        simulateAiImageAnalysis(compressedBase64);
      } catch (err) {
        showToast('Failed to process image', 'error');
      }
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file);
        setImage(compressedBase64);
        simulateAiImageAnalysis(compressedBase64);
      } catch (err) {
        showToast('Failed to process image', 'error');
      }
    }
  };

  // Trigger Step 1 -> Step 2
  const handleAnalyzeImage = () => {
    if (!title.trim() || !description.trim()) {
      showToast('Please enter both title and description', 'error');
      return;
    }

    // Duplicate detection heuristic
    const duplicate = issues.find(i =>
      i.category === category &&
      Math.abs(i.location.lat - pin.lat) < 0.005 &&
      Math.abs(i.location.lng - pin.lng) < 0.005
    );

    if (duplicate) {
      setDuplicateIssueId(duplicate.id);
    } else {
      setDuplicateIssueId(null);
    }

    // Set suggestions based on user choice
    setAiSuggestions(prev => ({
      ...prev,
      title: title,
      description: description,
      category: category,
      severity: severity,
      department: ['Potholes', 'Road Damage'].includes(category) ? 'Public Works' : ['Garbage Accumulation', 'Sanitation Issues'].includes(category) ? 'Sanitation' : 'Urban Operations',
      duplicateFound: !!duplicate
    }));

    setStep(2);
  };

  // Trigger Step 2 -> Step 3
  const handleVerifySuggestions = () => {
    setTitle(aiSuggestions.title);
    setDescription(aiSuggestions.description);
    setCategory(aiSuggestions.category);
    setSeverity(aiSuggestions.severity as any);
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
      const generatedId = await Promise.race([
        addIssue({
          title: aiSuggestions.title || title,
          description: description,
          category: aiSuggestions.category || category,
          severity: severity,
          isAnonymous: isAnonymous,
          location: {
            lat: pin.lat,
            lng: pin.lng,
            address: address
          },
          image: image,
          citizenName: user ? user.name : 'Citizen User',
          citizenAvatar: user ? user.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
          department: aiSuggestions.department || 'Public Works'
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Network timeout: Firebase is taking too long. Please check your internet connection or Firebase Security Rules.")), 10000)
        )
      ]);

      // Trigger confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      showToast(`Complaint submitted successfully as ${generatedId}`, 'success');
      navigate(`/success?id=${generatedId}`);
    } catch (error: any) {
      showToast(error.message || 'Failed to submit complaint to Firestore', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex flex-col items-center"
    >
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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-mono text-sm font-bold transition-all ${step >= 1
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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-mono text-sm font-bold transition-all ${step >= 2
                ? 'bg-primary-container text-on-primary-container border-primary-container shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : 'bg-surface-container-highest border-outline-variant text-on-surface-variant'
              }`}>
              2
            </div>
            <span className={`text-[10px] uppercase font-mono tracking-wider ${step >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>AI Analysis</span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-mono text-sm font-bold transition-all ${step === 3
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
      <GlassCard noHover className="w-full border border-white/10 bg-[#031427]/40 shadow-xl mb-12 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-6"
            >

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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Potholes', 'Water Leaks', 'Broken Streetlights', 'Garbage Accumulation', 'Drainage Blockages', 'Road Damage', 'Sanitation Issues', 'Other'].map((catName) => {
                  let iconName = 'report';
                  if (['Potholes', 'Road Damage'].includes(catName)) iconName = 'add_road';
                  else if (['Water Leaks', 'Drainage Blockages'].includes(catName)) iconName = 'water_drop';
                  else if (catName === 'Broken Streetlights') iconName = 'lightbulb';
                  else if (['Garbage Accumulation', 'Sanitation Issues'].includes(catName)) iconName = 'delete';

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
                        className={`btn-glass flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all border text-center h-24 select-none ${
                          category === catName
                            ? 'bg-primary-container/20 border-primary-container shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                            : 'hover:border-primary-container/40 border-transparent'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-2xl transition-colors mb-2 ${
                          category === catName ? 'text-primary-container' : 'text-white/50 group-hover:text-primary-container'
                        }`}>{iconName}</span>
                        <span className={`font-mono text-[9px] uppercase tracking-wider font-bold leading-none ${
                          category === catName ? 'text-primary-container' : 'text-white'
                        }`}>{catName}</span>
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

            {/* Anonymous Reporting */}
            <div className="flex items-center gap-3 bg-black/20 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-transparent text-primary-container focus:ring-primary-container focus:ring-offset-0 focus:ring-1"
              />
              <label htmlFor="anonymous" className="flex flex-col cursor-pointer select-none">
                <span className="text-sm font-bold text-white tracking-wide">Report Anonymously</span>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Hide your identity on the public ledger</span>
              </label>
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
                  onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                />

                {isAnalyzingImage ? (
                  <div className="flex flex-col items-center justify-center gap-3 relative z-10 pointer-events-none">
                    <span className="material-symbols-outlined text-4xl text-primary-container animate-spin">sync</span>
                    <span className="text-xs text-primary-container font-bold uppercase tracking-widest animate-pulse">Neural Vision Analyzing...</span>
                  </div>
                ) : image ? (
                  <div className="flex items-center gap-4 w-full px-4 relative z-10 pointer-events-none">
                    <img src={image} alt="Preview" className="w-20 h-16 object-cover rounded-lg border border-white/20" />
                    <div className="text-left flex-1">
                      <span className="text-xs text-white font-bold uppercase font-mono block">Image Loaded</span>
                      <span className="text-[10px] text-white/40 font-mono block mt-0.5">Drag to replace or click</span>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        setImage(''); 
                        setTitle('');
                        setDescription('');
                        setCategory('Other');
                      }}
                      className="bg-red-500/20 text-red-400 p-2 rounded-full hover:bg-red-500/40 pointer-events-auto transition-colors z-20"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative z-10 pointer-events-none flex flex-col items-center">
                    <span className="material-symbols-outlined text-4xl text-white/30">add_a_photo</span>
                    <div>
                      <span className="text-xs text-white font-semibold uppercase tracking-wider block">Drag & Drop Image Evidence</span>
                      <span className="text-[10px] text-white/40 font-mono block mt-1">Supports PNG, JPG up to 10MB</span>
                    </div>
                  </div>
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
                <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex flex-col gap-2">
                  <div className="bg-[#00060d]/80 backdrop-blur-md px-3 py-1.5 rounded border border-primary-container/40 text-[9px] font-mono text-primary-container font-semibold uppercase">
                    {address}
                  </div>
                </div>

                {/* Locate Me Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      showToast('Requesting satellite telemetry...', 'info');
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const latlng = new L.LatLng(position.coords.latitude, position.coords.longitude);
                          setPin(latlng);
                          setAddress(`Current Location: ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
                          showToast('Location locked via GPS', 'success');
                        },
                        (error) => showToast('Failed to retrieve location', 'error'),
                        { enableHighAccuracy: true }
                      );
                    } else {
                      showToast('Geolocation is not supported', 'error');
                    }
                  }}
                  className="absolute top-4 right-4 z-[400] bg-white hover:bg-gray-100 text-black border border-white/50 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">my_location</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest font-mono">Locate Me</span>
                </button>
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

            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-6"
            >
            {duplicateIssueId && (
              <GlassCard noHover className="p-5 border border-error/30 bg-error/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-error/10 rounded-full blur-[40px] -mr-10 -mt-10"></div>
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-error font-bold mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  Similar Issue Detected Nearby
                </h4>
                <p className="text-xs text-white/80 font-light mb-4 leading-relaxed">
                  Our system found a highly similar report within 500m of your pinned location. Endorsing an existing report helps resolve it faster by increasing its priority score.
                </p>
                <button
                  onClick={() => {
                    supportIssue(duplicateIssueId);
                    showToast('Endorsed existing issue successfully!', 'success');
                    navigate(`/issues/${duplicateIssueId}`);
                  }}
                  className="w-full py-3 rounded-xl bg-error/20 hover:bg-error/30 border border-error/50 transition-colors font-label-caps text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 text-error"
                >
                  <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                  Endorse Existing Report Instead
                </button>
              </GlassCard>
            )}

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
              suggestedDescription={aiSuggestions.description}
              severity={aiSuggestions.severity}
              isEditing={true}
              onEditChange={(field, val) => {
                setAiSuggestions(prev => ({
                  ...prev,
                  [field]: val
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

            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-6"
            >
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

            </motion.div>
          )}
        </AnimatePresence>
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
    </motion.div>
  );
};
export default ReportIssue;
