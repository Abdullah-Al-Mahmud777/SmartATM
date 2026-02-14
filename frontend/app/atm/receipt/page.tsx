'use client';

import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

export default function Receipt() {
  const router = useRouter();

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

  const recentTransactions = [
    { id: 'TXN001', type: 'Withdraw', amount: 5000, date: '2026-02-13', time: '10:30 AM', status: 'Success', cardNumber: '1234' },
    { id: 'TXN002', type: 'Deposit', amount: 10000, date: '2026-02-12', time: '02:15 PM', status: 'Success', cardNumber: '1234' },
    { id: 'TXN003', type: 'Transfer', amount: 3000, date: '2026-02-11', time: '11:45 AM', status: 'Success', cardNumber: '1234' },
  ];

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
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
          <p className="text-gray-600 mb-6">Click on any transaction to download PDF receipt</p>

          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => generatePDF(transaction)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{transaction.type}</p>
                    <p className="text-sm text-gray-600">{transaction.date} at {transaction.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-800">৳{transaction.amount.toLocaleString()}</p>
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                      Download PDF →
                    </button>
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
      </div>
    </div>
  );
}
