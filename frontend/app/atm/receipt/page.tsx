'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Receipt() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    try {
      const token = localStorage.getItem('atmToken');
      if (!token) {
        router.push('/atm/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/receipt/recent`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
      } else {
        console.error('Failed to fetch transactions:', data.message);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // If receipt endpoint fails, fallback to transaction history
      try {
        const token = localStorage.getItem('atmToken');
        const fallbackResponse = await fetch(`${API_URL}/api/transactions/history?limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData.success) {
          // Transform transaction history to receipt format
          const formattedTransactions = fallbackData.transactions.map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: Math.abs(t.amount),
            date: new Date(t.date).toLocaleDateString(),
            time: new Date(t.date).toLocaleTimeString(),
            status: t.status,
            cardNumber: '****'
          }));
          setTransactions(formattedTransactions);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (transaction: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('SmartATM', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Transaction Receipt', 105, 30, { align: 'center' });
    
    // Line
    doc.line(20, 35, 190, 35);
    
    // Transaction Details
    doc.setFontSize(11);
    let y = 50;
    doc.text(`Transaction ID: ${transaction.id}`, 20, y);
    y += 10;
    doc.text(`Type: ${transaction.type}`, 20, y);
    y += 10;
    doc.text(`Amount: ৳${transaction.amount.toLocaleString()}`, 20, y);
    y += 10;
    doc.text(`Date: ${transaction.date}`, 20, y);
    y += 10;
    doc.text(`Time: ${transaction.time}`, 20, y);
    y += 10;
    doc.text(`Status: ${transaction.status}`, 20, y);
    y += 10;
    doc.text(`Card Number: **** **** **** ${transaction.cardNumber}`, 20, y);
    
    // Footer
    y += 20;
    doc.line(20, y, 190, y);
    y += 10;
    doc.setFontSize(9);
    doc.text('Thank you for using SmartATM', 105, y, { align: 'center' });
    doc.text('For support: 16247 | support@smartatm.com', 105, y + 7, { align: 'center' });
    
    // Save PDF
    doc.save(`receipt-${transaction.id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📄 Receipt Generator</h1>
          <button
            onClick={() => router.push('/atm/dashboard')}
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-50"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <p className="text-gray-600">No transactions found</p>
            <button
              onClick={() => router.push('/atm/dashboard')}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
              <p className="text-gray-600 mb-6">Click on any transaction to download PDF receipt</p>

              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => generatePDF(transaction)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{transaction.type}</p>
                        <p className="text-sm text-gray-600">{transaction.date} at {transaction.time}</p>
                        <p className="text-xs text-gray-500 mt-1">ID: {transaction.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-800">৳{transaction.amount.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded ${transaction.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {transaction.status}
                        </span>
                        <p className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-1">
                          Download PDF →
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Tip: Keep your receipts for record keeping and tax purposes
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
