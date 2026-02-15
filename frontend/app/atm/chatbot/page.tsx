'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Chatbot() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hello! I am Shuvo 2.0, your AI banking assistant. How can I help you today?', sender: 'bot', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const quickReplies = language === 'en' 
    ? [
        { text: 'Check Balance', query: 'What is my balance?' },
        { text: 'How to Transfer?', query: 'How do I transfer money?' },
        { text: 'ATM Location', query: 'Where is the nearest ATM?' },
        { text: 'Transaction Status', query: 'Check my transaction status' },
      ]
    : [
        { text: 'ব্যালেন্স চেক', query: 'আমার ব্যালেন্স কত?' },
        { text: 'ট্রান্সফার কিভাবে?', query: 'টাকা ট্রান্সফার কিভাবে করব?' },
        { text: 'ATM লোকেশন', query: 'কাছের ATM কোথায়?' },
        { text: 'ট্রানজ্যাকশন স্ট্যাটাস', query: 'আমার ট্রানজ্যাকশন চেক করুন' },
      ];

  const transactions = [
    { id: 'TXN001', status: 'Success', amount: 5000, type: 'Withdraw' },
    { id: 'TXN002', status: 'Success', amount: 10000, type: 'Deposit' },
    { id: 'TXN003', status: 'Pending', amount: 3000, type: 'Transfer' },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'en' ? 'en-US' : 'bn-BD';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getBotResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    if (msg.includes('txn') || msg.includes('transaction')) {
      const txnId = userMessage.match(/TXN\d+/i)?.[0];
      if (txnId) {
        const transaction = transactions.find(t => t.id.toUpperCase() === txnId.toUpperCase());
        if (transaction) {
          return language === 'en'
            ? `Transaction ${transaction.id}: ${transaction.type} of ৳${transaction.amount} - Status: ${transaction.status}`
            : `ট্রানজ্যাকশন ${transaction.id}: ৳${transaction.amount} ${transaction.type} - স্ট্যাটাস: ${transaction.status}`;
        }
        return language === 'en' ? 'Transaction not found.' : 'ট্রানজ্যাকশন পাওয়া যায়নি।';
      }
      return language === 'en' ? 'Please provide a transaction ID.' : 'একটি ট্রানজ্যাকশন আইডি দিন।';
    }

    if (msg.includes('balance') || msg.includes('ব্যালেন্স')) {
      return language === 'en' ? 'Your balance is ৳50,000.' : 'আপনার ব্যালেন্স ৳৫০,০০০।';
    }

    return language === 'en' ? "I'm here to help!" : 'আমি সাহায্য করতে এখানে আছি!';
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setTimeout(() => {
      const botMsg: Message = { text: getBotResponse(input), sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    }, 500);
    setInput('');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'bn' : 'en');
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-4xl">🤖</div>
            <div>
              <h1 className="text-2xl font-bold">Shuvo 2.0</h1>
              <p className="text-sm text-blue-100">AI Banking Assistant</p>
            </div>
          </div>
          <button onClick={toggleLanguage} className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold">
            {language === 'en' ? '🇧🇩 বাংলা' : '🇺🇸 English'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-white">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
                }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-6 py-3 bg-gray-50 border-t flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button key={index} onClick={() => { setInput(reply.query); setTimeout(handleSend, 100); }}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200">
                {reply.text}
              </button>
            ))}
          </div>

          {/* Input Area - Fixed Text Color */}
          <div className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <button onClick={() => { setIsListening(true); recognitionRef.current?.start(); }}
                className={`p-3 rounded-lg ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-black'}`}>
                {isListening ? '🎤' : '🎙️'}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type here..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-black font-medium outline-none"
              />
              <button onClick={handleSend} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}