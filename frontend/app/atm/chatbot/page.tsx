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
    // Initialize Speech Recognition
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

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getBotResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    // Transaction Status Check
    if (msg.includes('txn') || msg.includes('transaction')) {
      const txnId = userMessage.match(/TXN\d+/i)?.[0];
      if (txnId) {
        const transaction = transactions.find(t => t.id.toUpperCase() === txnId.toUpperCase());
        if (transaction) {
          return language === 'en'
            ? `Transaction ${transaction.id}: ${transaction.type} of ৳${transaction.amount} - Status: ${transaction.status}`
            : `ট্রানজ্যাকশন ${transaction.id}: ৳${transaction.amount} ${transaction.type} - স্ট্যাটাস: ${transaction.status}`;
        }
        return language === 'en' ? 'Transaction not found. Please check the ID.' : 'ট্রানজ্যাকশন পাওয়া যায়নি। আইডি চেক করুন।';
      }
      return language === 'en' 
        ? 'Please provide your transaction ID (e.g., TXN001) to check status.'
        : 'আপনার ট্রানজ্যাকশন আইডি দিন (যেমন: TXN001) স্ট্যাটাস চেক করতে।';
    }

    // Balance Check
    if (msg.includes('balance') || msg.includes('ব্যালেন্স')) {
      return language === 'en' 
        ? 'Your current balance is ৳50,000. You can withdraw, deposit, or transfer anytime!'
        : 'আপনার বর্তমান ব্যালেন্স ৳৫০,০০০। আপনি যেকোনো সময় টাকা তুলতে, জমা বা ট্রান্সফার করতে পারেন!';
    }

    // Transfer Guide
    if (msg.includes('transfer') || msg.includes('ট্রান্সফার')) {
      return language === 'en'
        ? 'To transfer money: 1) Go to Dashboard 2) Click "Transfer" 3) Enter account number and amount 4) Confirm. Easy!'
        : 'টাকা ট্রান্সফার করতে: ১) ড্যাশবোর্ডে যান ২) "ট্রান্সফার" ক্লিক করুন ৩) একাউন্ট নম্বর এবং পরিমাণ দিন ৪) কনফার্ম করুন। সহজ!';
    }

    // ATM Location
    if (msg.includes('atm') || msg.includes('location') || msg.includes('লোকেশন')) {
      return language === 'en'
        ? 'You can find the nearest ATM using our Emergency Services > Find Nearest Branch feature. It will open Google Maps for you!'
        : 'আপনি আমাদের Emergency Services > Find Nearest Branch ফিচার ব্যবহার করে কাছের ATM খুঁজে পেতে পারেন। এটি আপনার জন্য Google Maps খুলবে!';
    }

    // Withdraw
    if (msg.includes('withdraw') || msg.includes('তুলতে')) {
      return language === 'en'
        ? 'To withdraw money, go to Dashboard and click "Withdraw". You can withdraw up to ৳20,000 per day.'
        : 'টাকা তুলতে, ড্যাশবোর্ডে যান এবং "Withdraw" ক্লিক করুন। আপনি প্রতিদিন ৳২০,০০০ পর্যন্ত তুলতে পারেন।';
    }

    // PIN Change
    if (msg.includes('pin') || msg.includes('পিন')) {
      return language === 'en'
        ? 'To change your PIN: Dashboard > Change PIN. Enter current PIN, new PIN, and confirm. Keep it secure!'
        : 'আপনার পিন পরিবর্তন করতে: ড্যাশবোর্ড > Change PIN। বর্তমান পিন, নতুন পিন দিন এবং কনফার্ম করুন। এটি সুরক্ষিত রাখুন!';
    }

    // Emergency
    if (msg.includes('emergency') || msg.includes('block') || msg.includes('জরুরি')) {
      return language === 'en'
        ? 'For emergencies, use the Emergency Services button on Dashboard. You can block your card, report fraud, or call helpline 16247.'
        : 'জরুরি পরিস্থিতিতে, ড্যাশবোর্ডে Emergency Services বাটন ব্যবহার করুন। আপনি কার্ড ব্লক, জালিয়াতি রিপোর্ট বা হেল্পলাইন 16247 এ কল করতে পারেন।';
    }

    // Default Response
    return language === 'en'
      ? "I'm here to help! You can ask me about balance, transfers, ATM locations, transaction status, or any banking service."
      : 'আমি সাহায্য করতে এখানে আছি! আপনি আমাকে ব্যালেন্স, ট্রান্সফার, ATM লোকেশন, ট্রানজ্যাকশন স্ট্যাটাস বা যেকোনো ব্যাংকিং সেবা সম্পর্কে জিজ্ঞাসা করতে পারেন।';
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const botResponse: Message = {
        text: getBotResponse(input),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);

    setInput('');
  };

  const handleQuickReply = (query: string) => {
    setInput(query);
    setTimeout(() => handleSend(), 100);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      alert('Voice recognition is not supported in your browser.');
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'bn' : 'en');
    const msg: Message = {
      text: language === 'en' 
        ? 'ভাষা বাংলায় পরিবর্তন করা হয়েছে। আমি এখন বাংলায় উত্তর দেব।'
        : 'Language changed to English. I will now respond in English.',
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, msg]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleLanguage}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              {language === 'en' ? '🇧🇩 বাংলা' : '🇺🇸 English'}
            </button>
            <button
              onClick={() => router.push('/atm/dashboard')}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-6 py-3 bg-gray-50 border-t">
            <p className="text-xs text-gray-600 mb-2">
              {language === 'en' ? 'Quick Replies:' : 'দ্রুত উত্তর:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply.query)}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  {reply.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <button
                onClick={startListening}
                className={`p-3 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isListening ? '🎤' : '🎙️'}
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={language === 'en' ? 'Type your message...' : 'আপনার বার্তা লিখুন...'}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {language === 'en' ? 'Send' : 'পাঠান'}
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            {language === 'en'
              ? '💡 Tip: You can use voice typing by clicking the microphone button, or use quick reply buttons for faster responses!'
              : '💡 টিপ: মাইক্রোফোন বাটনে ক্লিক করে ভয়েস টাইপিং ব্যবহার করুন, অথবা দ্রুত উত্তরের জন্য কুইক রিপ্লাই বাটন ব্যবহার করুন!'}
          </p>
        </div>
      </div>
    </div>
  );
}
