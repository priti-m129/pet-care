import React, { useState, useContext, useEffect, useRef } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';
import DoctorHeader from '../../components/headers/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

// --- CHATBOT CONFIG ---
// ⚠️ SECURITY WARNING: In a real production app, never expose API keys in frontend code.
const GROQ_API_KEY = "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";

// --- CLEAN SVG ICONS ---
const SearchIcon = () => (
  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChevronIcon = ({ isOpen }) => (
  <svg 
    className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const DoctorHelp = ({ onNavigate, user }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary } = config;

  // --- EXISTING STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaqId, setOpenFaqId] = useState(null);
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });

  // --- CHATBOT STATE ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, sender: 'bot', text: 'Hello Doctor! I am your AI Support Assistant. How can I help you manage your practice today? 👨‍⚕️', type: 'welcome' }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // --- SCROLL CHAT TO BOTTOM ---
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // --- CHATBOT LOGIC ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;
    
    const newUserMsg = { id: Date.now(), sender: 'user', text: userMessage };
    setChatHistory(prev => [...prev, newUserMsg]);
    const currentMessageText = userMessage;
    setUserMessage('');
    setIsTyping(true);

    const messagesPayload = [
      { 
        role: "system", 
        content: "You are a helpful AI assistant for Doctors using the 'Healthy Paws' platform. Help them with scheduling, account settings, billing, and technical tools. Keep answers concise." 
      },
      ...chatHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      })),
      { role: 'user', content: currentMessageText }
    ];

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messagesPayload,
          model: 'llama3-8b-8192',
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      const replyText = data.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";

      setChatHistory(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: replyText }]);

    } catch (error) {
      console.error("Chatbot Error:", error);
      setChatHistory(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: "I'm having trouble connecting. Please try again or contact support." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- EXISTING DATA ---
  const faqs = [
    {
      id: 1,
      category: 'Account',
      question: 'How long does account verification take?',
      answer: 'Account verification typically takes 24 to 48 hours. You can track the status on your dashboard. You will receive a notification once your documents are approved.'
    },
    {
      id: 2,
      category: 'Account',
      question: 'What documents are required for registration?',
      answer: 'You need to upload your MBBS Degree certificate, Medical Council Registration proof, an updated Resume/CV, and a valid Identity Proof.'
    },
    {
      id: 3,
      category: 'Appointments',
      question: 'Can I cancel an appointment after accepting it?',
      answer: 'Yes, you can cancel appointments, but we recommend notifying the patient as soon as possible via the consultation details page.'
    },
    {
      id: 4,
      category: 'Availability',
      question: 'How do I set my availability?',
      answer: 'Go to the "Availability" tab in your sidebar. You can select specific dates and time slots when you are available for consultations.'
    },
    {
      id: 5,
      category: 'Security',
      question: 'Is video consultation secure?',
      answer: 'Yes, all video consultations are end-to-end encrypted to ensure patient privacy and data security as per medical standards.'
    },
    {
      id: 6,
      category: 'Prescriptions',
      question: 'Can I edit a prescription after sending it?',
      answer: 'Once a prescription is finalized, it cannot be edited directly. However, you can add a follow-up note or a new prescription.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.subject || !contactForm.message) {
      alert("Please fill in all fields.");
      return;
    }
    alert("Support request sent successfully!");
    setContactForm({ subject: '', message: '' });
  };

  return (
    <div className="min-h-screen w-full flex" style={{ background: bg }}>
      <DoctorSidebar onNavigate={onNavigate} user={user} activePage="help-center" />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <DoctorHeader title="Help Center" onNavigate={onNavigate} />
        
        <div className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-5xl mx-auto space-y-16">
            
            {/* --- HERO SEARCH --- */}
            <div className="text-center space-y-6">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">How can we help?</h1>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Browse our frequently asked questions or send us a message.
              </p>
              
              <div className="max-w-2xl mx-auto relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  className="w-full py-4 pl-14 pr-6 rounded-2xl border-0 shadow-lg text-gray-800 text-lg focus:ring-4 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* --- FAQ GRID --- */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-1 rounded-full" style={{ background: primary }}></div>
                <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
              </div>
              
              {filteredFaqs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredFaqs.map((faq) => (
                    <div 
                      key={faq.id} 
                      className={`bg-white rounded-2xl border transition-all duration-200 ${openFaqId === faq.id ? 'border-gray-300 shadow-md ring-1 ring-gray-50' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-start justify-between p-6 text-left focus:outline-none"
                      >
                        <div className="flex-1 pr-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider rounded-md px-2 py-0.5 inline-block mb-2 bg-gray-100 text-gray-600">
                            {faq.category}
                          </span>
                          <span className={`font-semibold text-lg leading-snug ${openFaqId === faq.id ? 'text-gray-900' : 'text-gray-600'}`}>
                            {faq.question}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <ChevronIcon isOpen={openFaqId === faq.id} />
                        </div>
                      </button>
                      
                      {openFaqId === faq.id && (
                        <div className="px-6 pb-6 pt-0">
                          <p className="text-gray-600 leading-relaxed text-sm">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">No results found for "<span className="text-gray-900">{searchTerm}</span>"</p>
                </div>
              )}
            </div>

            {/* --- CONTACT SECTION --- */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid md:grid-cols-12">
                
                {/* Left Column: Contact Details */}
                <div className="md:col-span-4 bg-gray-50 p-8 md:p-10 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Support</h3>
                  <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                    Can't find the answer you're looking for? Get in touch with our support team directly.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-blue-300 transition cursor-pointer group">
                      <div className="p-2 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <MailIcon />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                        <p className="text-sm font-semibold text-gray-900">support@vetcare.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-blue-300 transition cursor-pointer group">
                      <div className="p-2 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <PhoneIcon />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">+1 (800) 123-4567</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Form */}
                <div className="md:col-span-8 p-8 md:p-10">
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Topic</label>
                        <select
                          className="w-full p-3.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-gray-700"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                          required
                        >
                          <option value="" disabled>Select a topic...</option>
                          <option value="Technical Issue">Technical Issue</option>
                          <option value="Billing">Billing / Payment</option>
                          <option value="Account">Account Access</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                      <textarea
                        rows="5"
                        className="w-full p-3.5 rounded-xl border border-gray-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none resize-none transition-all text-gray-700"
                        placeholder="Describe your issue in detail..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        required
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-8 py-3.5 rounded-xl text-white font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
                        style={{ background: primary }}
                      >
                        Send Message
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- FLOATING CHAT WIDGET --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
        
        {/* Chat Window Popup */}
        {isChatOpen && (
          <div className="pointer-events-auto mb-4 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transform transition-all origin-bottom-right animate-fade-in-up">
            
            {/* Chat Header */}
            <div className="bg-indigo-600 p-4 flex items-center justify-between text-white shadow-md flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
                <div>
                  <h2 className="font-bold text-sm">Healthy Paws AI</h2>
                  <p className="text-[10px] text-indigo-100">Doctor Support</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white hover:bg-white/20 p-1 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar" id="chat-container">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.type === 'welcome' ? (
                    <div className="bg-white border border-indigo-100 p-3 rounded-xl shadow-sm max-w-[90%] mx-auto text-center">
                        <p className="text-gray-700 font-medium text-sm">{msg.text}</p>
                    </div>
                  ) : (
                    <div className={`max-w-[85%] px-4 py-2 rounded-xl shadow-sm text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-xl rounded-bl-none text-xs text-gray-500 italic">
                    Typing...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
              <div className="flex gap-2 bg-gray-100 p-2 rounded-lg border border-transparent focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-indigo-200 transition-all shadow-inner">
                <input 
                  id="chat-input"
                  type="text" 
                  value={userMessage} 
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Ask about scheduling, billing..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 px-2 text-sm"
                  disabled={isTyping}
                />
                <button 
                  type="submit" 
                  disabled={!userMessage.trim() || isTyping}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white p-1.5 rounded-md transition-colors shadow-sm w-8 h-8 flex items-center justify-center"
                >
                  ➤
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Floating Trigger Button */}
        {!isChatOpen && (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="pointer-events-auto bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl hover:shadow-indigo-600/40 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center group relative"
            style={{ width: '60px', height: '60px' }}
          >
            <span className="text-3xl group-hover:rotate-12 transition-transform duration-300">🤖</span>
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
          </button>
        )}

      </div>
    </div>
  );
};

export default DoctorHelp;