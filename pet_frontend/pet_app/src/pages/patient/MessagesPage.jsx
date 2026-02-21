import React, { useState, useContext, useEffect, useRef } from 'react';
import { ConfigContext } from '../../contexts/ConfigContext';

// ⚠️ SECURITY WARNING: In a real production app, never expose API keys in frontend code.
const GROQ_API_KEY = "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";

const MessagesPage = ({ onNavigate }) => {
  const config = useContext(ConfigContext);
  const { background_color: bg, surface_color: surface, text_color: text, primary_action_color: primary, font_size: fontSize } = config;

  // --- TAB STATE (Removed 'chat') ---
  const [activeTab, setActiveTab] = useState('faq'); 

  // --- FAQ STATE ---
  const [openFaqId, setOpenFaqId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- CHATBOT STATE ---
  const [isChatOpen, setIsChatOpen] = useState(false); // Controls the floating widget
  const [chatHistory, setChatHistory] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am your AI Vet Assistant. Click here to ask me anything! 🐾', type: 'welcome' }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // --- CONTACT FORM STATE ---
  const [formData, setFormData] = useState({ subject: '', message: '', urgent: false });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- SCROLL CHAT TO BOTTOM ---
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // --- NAVIGATION ---
  const navigateTo = (page) => {
    if (onNavigate) onNavigate(page);
  };

  // --- FAQ DATA ---
  const faqData = [
    { id: 1, q: "How do I book a new appointment?", a: "Go to the 'Appointments' tab, click 'Book New', select your pet, choose a doctor, pick a time slot, and confirm." },
    { id: 2, q: "How do I pay for my consultation?", a: "Once the doctor writes the prescription, the status changes to 'Ready for Payment'. Click 'Pay Now' to complete the transaction." },
    { id: 3, q: "Where can I view my prescription?", a: "After paying, the doctor will update your prescription. A 'Prescription' button will appear on your appointment card." },
    { id: 4, q: "Can I cancel an appointment?", a: "Yes. You can cancel any pending appointment from your appointment list." }
  ];

  const filteredFaqs = faqData.filter(item => 
    item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- REAL CHATBOT LOGIC (GROQ API) ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;
    
    // 1. Add User Message
    const newUserMsg = { id: Date.now(), sender: 'user', text: userMessage };
    setChatHistory(prev => [...prev, newUserMsg]);
    const currentMessageText = userMessage;
    setUserMessage('');
    setIsTyping(true);

    // 2. Prepare Context
    const messagesPayload = [
      { 
        role: "system", 
        content: "You are a helpful and friendly veterinary assistant for 'Healthy Paws'. Keep answers concise (under 3 sentences) and informative. If you don't know something, advise the user to contact the clinic." 
      },
      ...chatHistory.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      })),
      { role: 'user', content: currentMessageText }
    ];

    try {
      // 3. Call Groq API
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
        text: "I'm having trouble connecting right now. Please try again or use the Contact Us form." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- CONTACT FORM LOGIC ---
  const handleContactSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => { setIsSubmitted(false); setFormData({ subject: '', message: '', urgent: false }); }, 3000);
  };

  return (
    <div className="min-h-full w-full flex" style={{ background: bg }}>
      
      {/* --- SIDEBAR --- */}
      <div className="w-64 h-full flex-shrink-0 bg-white shadow-xl border-r border-gray-200 flex flex-col z-40">
        <div className="flex flex-col h-full">
          <div className="bg-[#14b8a6] p-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="text-3xl">👤</div>
              <div><p className="font-bold text-gray-800">My Account</p><p className="text-sm text-gray-500">Patient Portal</p></div>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2 py-4 overflow-y-auto">
            <button onClick={() => navigateTo('patient-dashboard')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-left group"><span className="text-xl">🏠</span><span className="font-semibold text-gray-700">Dashboard</span></button>
            <button onClick={() => navigateTo('my-pets')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-left group"><span className="text-xl">🐕</span><span className="font-semibold text-gray-700">My Pets</span></button>
            <button onClick={() => navigateTo('appointments')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-left group"><span className="text-xl">📅</span><span className="font-semibold text-gray-700">Appointments</span></button>
            <button onClick={() => navigateTo('marketplace')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-left group"><span className="text-xl">🛒</span><span className="font-semibold text-gray-700">Marketplace</span></button>
            <button onClick={() => navigateTo('orders')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-left group"><span className="text-xl">📦</span><span className="font-semibold text-gray-700">Orders</span></button>
            
            {/* Active */}
            <button onClick={() => navigateTo('messages')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-left bg-gray-50 border-l-4 border-[#14b8a6] shadow-inner"><span className="text-xl">💬</span><span className="font-semibold text-gray-800">Help & Support</span></button>
            
            <button onClick={() => navigateTo('profile')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-left group"><span className="text-xl">👤</span><span className="font-semibold text-gray-700">Profile</span></button>
          </div>
        </div>
      </div>
      
      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-full relative bg-gray-50">
        
        {/* Header */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-white/20 px-8 py-4 flex justify-between items-center shadow-sm z-20">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Support Center</h1>
            <p className="text-sm text-gray-500">How can we help you today?</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar pb-24">
          <div className="max-w-5xl mx-auto">
            
            {/* --- TABS (Only FAQ & Contact) --- */}
            <div className="flex gap-1 p-1.5 bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 mx-auto w-fit">
              {[
                { id: 'faq', label: 'FAQ', icon: '❓', color: 'text-blue-600', bg: 'bg-blue-50' },
                { id: 'contact', label: 'Contact Admin', icon: '✉️', color: 'text-purple-600', bg: 'bg-purple-50' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    activeTab === tab.id
                      ? `${tab.bg} ${tab.color} shadow-md transform scale-105`
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* --- FAQ TAB --- */}
            {activeTab === 'faq' && (
              <div className="animate-fade-in space-y-6">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search for answers..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>
                <div className="space-y-3">
                  {filteredFaqs.length > 0 ? filteredFaqs.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                      <button 
                        onClick={() => setOpenFaqId(openFaqId === item.id ? null : item.id)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-800 pr-4">{item.q}</span>
                        <span className={`transform transition-transform text-gray-400 ${openFaqId === item.id ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqId === item.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-5 pt-0 text-gray-600 leading-relaxed border-t border-gray-100 mt-2 bg-gray-50">{item.a}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                      <p className="text-gray-400">No results found.</p>
                      <button onClick={() => setSearchQuery('')} className="text-blue-500 underline text-sm mt-2">Clear search</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- CONTACT TAB --- */}
            {activeTab === 'contact' && (
              <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="w-full">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">📞</div>
                        <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">+91 98765 43210</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center">📧</div>
                        <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">support@healthypaws.com</p></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-4">Send a Message</h3>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <select required name="subject" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-400 outline-none">
                        <option value="">Select Topic</option>
                        <option value="booking">Booking Issue</option>
                        <option value="payment">Payment Help</option>
                        <option value="other">Other</option>
                      </select>
                      <textarea required name="message" rows="4" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="Describe your issue..." className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-400 outline-none resize-none"></textarea>
                      <button type="submit" disabled={isSubmitted} className={`w-full py-3 rounded-lg font-bold text-white transition-all ${isSubmitted ? 'bg-gray-400' : 'bg-teal-500 hover:bg-teal-600'}`}>
                        {isSubmitted ? 'Sent!' : 'Send Message'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- FLOATING CHAT WIDGET (New) --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
        
        {/* Chat Window Popup */}
        {isChatOpen && (
          <div className="pointer-events-auto mb-4 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transform transition-all origin-bottom-right animate-fade-in-up">
            
            {/* Chat Header */}
            <div className="bg-teal-500 p-4 flex items-center justify-between text-white shadow-md flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
                <div>
                  <h2 className="font-bold text-sm">Healthy Paws AI</h2>
                  <p className="text-[10px] text-teal-100">Powered by Groq</p>
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
                    <div className="bg-white border border-teal-100 p-3 rounded-xl shadow-sm max-w-[90%] mx-auto text-center">
                        <p className="text-gray-700 font-medium text-sm">{msg.text}</p>
                    </div>
                  ) : (
                    <div className={`max-w-[85%] px-4 py-2 rounded-xl shadow-sm text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-teal-500 text-white rounded-br-none' 
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
              <div className="flex gap-2 bg-gray-100 p-2 rounded-lg border border-transparent focus-within:border-teal-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-teal-200 transition-all shadow-inner">
                <input 
                  id="chat-input"
                  type="text" 
                  value={userMessage} 
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 px-2 text-sm"
                  disabled={isTyping}
                />
                <button 
                  type="submit" 
                  disabled={!userMessage.trim() || isTyping}
                  className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white p-1.5 rounded-md transition-colors shadow-sm w-8 h-8 flex items-center justify-center"
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
            className="pointer-events-auto bg-teal-500 hover:bg-teal-600 text-white p-4 rounded-full shadow-2xl hover:shadow-teal-500/40 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center group relative"
            style={{ width: '60px', height: '60px' }}
          >
            <span className="text-3xl group-hover:rotate-12 transition-transform duration-300">🤖</span>
            {/* Notification Dot */}
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
          </button>
        )}

      </div>
    </div>
  );
};

export default MessagesPage;