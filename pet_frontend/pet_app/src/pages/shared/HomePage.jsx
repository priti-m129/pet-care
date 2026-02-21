import React, { useContext, useState, useRef, useEffect } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';

// --- SVG ICONS ---
const Icons = {
  stethoscope: (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  ),
  grooming: (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>
  ),
  vaccination: (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
  ),
  appointment: (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  ),
  shop: (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
  ),
  star: <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>,
  quote: <svg className="w-8 h-8 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.0547 15.2383 14.8334 17.1837 14.8334L18.9337 14.8334L18.9337 12.1667L17.1837 12.1667C15.2383 12.1667 14.017 10.9454 14.017 9L14.017 6L18.9337 6L18.9337 21L14.017 21ZM5.08366 21L5.08366 18C5.08366 16.0547 6.30499 14.8334 8.25032 14.8334L10.0003 14.8334L10.0003 12.1667L8.25032 12.1667C6.30499 12.1667 5.08366 10.9454 5.08366 9L5.08366 6L10.0003 6L10.0003 21L5.08366 21Z"/></svg>,
  chat: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
  ),
  send: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
  ),
  x: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  )
};

// --- CHATBOT COMPONENT ---
const ChatWidget = ({ primaryColor, surfaceColor, textColor }) => {
  // --- GROQ API KEY CONFIGURATION ---
  const [apiKey, setApiKey] = useState('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');
  
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: "Hello! I'm Pet Care  AI. To register: Click the 'Book Appointment' button at the top. I can help with symptoms too!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (!apiKey) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: "Please add your Groq API Key in the settings."
        }]);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      // --- GROQ API LOGIC ---
      const systemPrompt = "You are a helpful veterinary assistant for Pet Care . Keep answers concise and friendly.";
      
      const messagesPayload = [
        { role: "system", content: systemPrompt },
        ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: input }
      ];

      // --- UPDATED MODEL NAME TO LLAMA 3.1 8B INSTANT ---
      const MODEL_NAME = 'llama-3.1-8b-instant';

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: messagesPayload,
          temperature: 0.7
        })
      });

      const data = await response.json();
      
      if (data.error) {
         throw new Error(data.error.message || data.error.status);
      }

      const botResponse = data.choices[0].message.content;
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: botResponse
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Error: ${error.message}. Please check your API key or network connection.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-200 mb-4 overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right chat-enter" style={{ height: '500px' }}>
          
          {/* Header */}
          <div className="p-4 text-white flex justify-between items-center" style={{ background: primaryColor }}>
            <div>
              <h3 className="font-bold text-lg">Pet Care  AI</h3>
              <p className="text-xs opacity-80">Online | Powered by Groq</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowSettings(!showSettings)} className="p-1 hover:bg-white/20 rounded-full transition">
                {Icons.settings}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition">
                {Icons.x}
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <label className="block text-xs font-bold text-gray-600 mb-1">Groq API Key</label>
              <input 
                type="password" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full text-xs p-2 border border-gray-300 rounded focus:outline-none focus:border-teal-500"
              />
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 chat-scroll">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'text-white rounded-br-none' 
                    : 'text-gray-800 rounded-bl-none border border-gray-200 bg-white'
                }`} style={msg.role === 'user' ? { background: primaryColor } : {}}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-700"
              />
              <button 
                onClick={handleSend} 
                disabled={!input.trim()}
                className="p-1 rounded-full text-white transition-opacity disabled:opacity-50 hover:scale-105"
                style={{ background: primaryColor }}
              >
                {Icons.send}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-transform hover:scale-110 text-white focus:outline-none"
        style={{ background: primaryColor }}
      >
        {isOpen ? Icons.x : Icons.chat}
      </button>
    </div>
  );
};

const HomePage = ({ onNavigate }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, secondary_action_color: secondary } = config;
  const fontSize = config.font_size;

  const services = [
    { icon: Icons.stethoscope, title: config.service_1_title, desc: 'Expert advice and diagnosis from certified professionals.' },
    { icon: Icons.grooming, title: config.service_2_title, desc: 'Keep your pet looking great with our grooming services.' },
    { icon: Icons.vaccination, title: config.service_3_title, desc: 'Essential shots and health tracking for longevity.' },
    { icon: Icons.appointment, title: config.service_4_title, desc: 'Seamless online scheduling to fit your busy life.' },
    { icon: Icons.shop, title: config.service_5_title, desc: 'Order food, toys, and meds delivered to your door.' },
  ];

  const doctors = [
    {
      name: "Dr. Sarah Jenkins",
      role: "Chief Surgeon",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      intro: "Specializing in complex orthopedic surgeries with over 15 years of experience. Dr. Jenkins is dedicated to restoring mobility and comfort to pets in need."
    },
    {
      name: "Dr. Michael Chen",
      role: "Veterinary Dermatologist",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      intro: "Expert in treating skin conditions and allergies. Dr. Chen uses the latest diagnostic tools to ensure your pet's coat and skin remain healthy."
    },
    {
      name: "Dr. James Wilson",
      role: "Senior Veterinarian",
      image: "https://z-cdn-media.chatglm.cn/files/de5222ae-6a11-465a-9a73-4e75e2ce8d1a.png?auth_key=1870229304-817f44c693424d8d9bad689a8ee29e70-0-c5bc052e67e1c54c97b66fa3cea0ac04",
      intro: "Bringing extensive experience in internal medicine. Dr. Wilson is known for his compassionate care and accurate diagnosis for both cats and dogs."
    }
  ];

  const reviews = [
    {
      name: "Jessica Miller",
      pet: "Bella (Golden Retriever)",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      text: "The team here is incredible! They treated Bella like she was their own. The online booking made everything so easy.",
      rating: 5
    },
    {
      name: "Tom Hiddleston",
      pet: "Loki (Cat)",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      text: "Dr. Chen solved Loki's skin issue in days when other clinics couldn't. Highly recommend their dermatology services.",
      rating: 5
    },
    {
      name: "Amanda Grant",
      pet: "Rocky (Bulldog)",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      text: "Professional, clean, and very caring. Rocky usually hates the vet, but he was happy here!",
      rating: 5
    }
  ];

  return (
    <div className="w-full font-sans text-slate-800" style={{ background: bg }}>
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-10 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2 space-y-6">
              <h1 className="font-extrabold leading-tight" style={{ fontSize: `${fontSize * 3.2}px`, color: text, lineHeight: 1.1 }}>
                {config.hero_headline}
              </h1>
              <p className="text-lg leading-relaxed" style={{ color: text, opacity: 0.75 }}>
                {config.hero_subtext}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button onClick={() => onNavigate('register-options')} className="px-8 py-4 font-bold text-white rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2" style={{ background: primary }}>Book Appointment</button>
                <button onClick={() => onNavigate('register-options')} className="px-8 py-4 font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">Our Services</button>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                 <img 
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                  alt="Happy Dog Portrait" 
                  className="w-full h-auto object-cover" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES SECTION --- */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Medical Services</h2>
            <div className="w-24 h-1 mx-auto rounded" style={{ background: primary }}></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 group cursor-pointer" onClick={() => onNavigate('register-options')}>
                <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full transition-colors duration-300 group-hover:scale-110" style={{ background: `${primary}15`, color: primary }}>{service.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BEST DOCTORS SECTION --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Meet Our Specialists</h2>
            <div className="w-24 h-1 mx-auto rounded mb-4" style={{ background: primary }}></div>
            <p className="text-slate-600 max-w-2xl mx-auto">Our team of highly qualified veterinarians is here to provide best care for your furry friends.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doc, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col h-full">
                <div className="h-64 w-full flex-shrink-0 relative">
                  <img src={doc.image} alt={doc.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-white font-bold text-xl">{doc.name}</h3>
                    <p className="text-teal-300 text-sm font-medium">{doc.role}</p>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
                    "{doc.intro}"
                  </p>
                  <div className="mt-auto">
                    <button 
                      onClick={() => onNavigate('login')}
                      className="w-full py-2.5 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2"
                      style={{ background: primary }}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PATIENT REVIEWS SECTION --- */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Happy Pet Parents</h2>
            <div className="w-24 h-1 mx-auto rounded mb-4" style={{ background: primary }}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 relative">
                <div className="absolute top-6 right-6 text-slate-200">
                  {Icons.quote}
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">{Icons.star}</span>
                  ))}
                </div>
                <p className="text-slate-600 italic mb-6 leading-relaxed">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-4 border-t pt-4 border-slate-100">
                  <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{review.name}</p>
                    <p className="text-xs text-slate-500">Parent of {review.pet}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-16 relative overflow-hidden" style={{ background: primary }}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to visit?</h2>
          <p className="text-teal-50 text-lg mb-8">Book an appointment today and give your pet care they deserve.</p>
          <button onClick={() => onNavigate('register-options')} className="px-8 py-3 bg-white text-teal-700 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-colors">Book Appointment Now</button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-slate-800 pb-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4" style={{ color: primary }}>Pet Care </h3>
            <p className="text-slate-400 leading-relaxed max-w-sm">Providing comprehensive veterinary care with love and expertise.</p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="hover:text-white cursor-pointer" onClick={() => onNavigate('home')}>Home</li>
              <li className="hover:text-white cursor-pointer" onClick={() => onNavigate('register-options')}>Services</li>
              <li className="hover:text-white cursor-pointer" onClick={() => onNavigate('register-doctor')}>For Doctors</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-slate-400">
              <li>support@Pet Care .com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-slate-500 text-sm pt-8">© {new Date().getFullYear()}  Platform. All rights reserved.</div>
      </footer>

      <ChatWidget 
        primaryColor={primary} 
        surfaceColor={surface} 
        textColor={text} 
      />
    </div>
  );
};

export default HomePage;