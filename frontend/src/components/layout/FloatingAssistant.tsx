import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

export const FloatingAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'Hello! I noticed an uptick in infrastructure reports. Would you like me to generate a summary or assist you in filing an issue?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let replyText = "I've analyzed your query. Let me know if I can help you search the map, check reports, or update permissions.";
      if (query.toLowerCase().includes('pothole') || query.toLowerCase().includes('infra')) {
        replyText = "I see. 64% of reported issues in Downtown are infrastructure related. I recommend checking the Map or filing a report using our multi-step 'Report Issue' wizard.";
      } else if (query.toLowerCase().includes('report') || query.toLowerCase().includes('file')) {
        replyText = "You can report a new issue by clicking the 'New Report' button in the sidebar. I will analyze uploaded images to pre-populate details for you.";
      } else if (query.toLowerCase().includes('status') || query.toLowerCase().includes('complaint')) {
        replyText = "You can view and filter all your active complaints inside the 'My Reports' panel. Potholes are resolved on average within 48 hours.";
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      {/* Chat Popover */}
      {isOpen && (
        <div className="w-80 glass-card rounded-2xl flex flex-col overflow-hidden transition-all duration-300 border border-primary-container/40 shadow-[0_0_30px_rgba(0,240,255,0.2)] animate-fade-in-up">
          <div className="bg-[#00060d]/80 p-5 border-b border-primary-container/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center border border-primary-container/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                <span className="material-symbols-outlined text-primary-container text-xl drop-shadow-[0_0_5px_#00f0ff]">smart_toy</span>
              </div>
              <div>
                <h5 className="text-sm font-bold text-white uppercase tracking-widest leading-tight">Civic AI</h5>
                <span className="text-[10px] font-mono text-primary-container font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span> Online
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="p-5 h-64 overflow-y-auto flex flex-col gap-4 text-sm bg-transparent">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-xl max-w-[85%] text-xs border leading-relaxed ${
                  msg.sender === 'ai'
                    ? 'bg-[#00060d] rounded-tl-none self-start border-primary-container/30 text-white shadow-[0_0_15px_rgba(0,240,255,0.1)] font-light'
                    : 'bg-primary-container/10 rounded-tr-none self-end border-primary-container/50 text-primary-container font-semibold'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="bg-[#00060d] p-3 rounded-xl rounded-tl-none self-start border-primary-container/30 text-white shadow-[0_0_15px_rgba(0,240,255,0.1)] font-light flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-primary-container/30 bg-[#00060d]/80 backdrop-blur-md">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-white/5 border border-primary-container/30 rounded-xl py-2.5 pl-4 pr-12 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all shadow-inner font-mono uppercase tracking-widest"
                placeholder="Ask AI..."
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-container hover:text-white transition-colors p-1.5 rounded-lg hover:bg-primary-container/20"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAB Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-2xl bg-[#00060d] shadow-[0_0_30px_rgba(0,240,255,0.3)] border border-primary-container/50 flex items-center justify-center text-primary-container hover:scale-105 hover:shadow-[0_0_40px_rgba(0,240,255,0.5)] transition-all duration-300 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-2 focus:ring-offset-[#00060d]"
      >
        {/* Subtle rotating gradient border effect */}
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(0,240,255,0.8)_360deg)] animate-[spin_3s_linear_infinite] rounded-2xl opacity-50"></div>
        <div className="absolute inset-[1px] bg-[#00060d] rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl drop-shadow-[0_0_10px_#00f0ff]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isOpen ? 'close' : 'assistant'}
          </span>
        </div>
      </button>
    </div>
  );
};
