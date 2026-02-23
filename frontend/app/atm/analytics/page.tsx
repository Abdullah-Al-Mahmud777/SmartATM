'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ১. পরিবেশ অনুযায়ী API URL সেট করা
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// TypeScript এর এরর এড়াতে ইন্টারফেস
interface MonthlyData {
  month: string;
  expenses: number;
  savings: number;
}

export default function Analytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [spending, setSpending] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('atmToken');
      if (!token) {
        router.push('/atm/login');
        return;
      }

      const overviewResponse = await fetch(`${API_URL}/api/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const overviewData = await overviewResponse.json();

      const spendingResponse = await fetch(`${API_URL}/api/analytics/spending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const spendingData = await spendingResponse.json();

      if (overviewData.success) setAnalytics(overviewData.analytics);
      if (spendingData.success) setSpending(spendingData.spending);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const expenses = (analytics?.totalWithdrawals || 0) + (analytics?.totalTransfers || 0);
  const savings = analytics?.currentBalance || 0;
  const total = expenses + savings;
  const savingsRate = total > 0 ? Math.round((savings / total) * 100) : 0;

  const monthlyData: MonthlyData[] = spending?.monthlyBreakdown || [
    { month: 'Jan', expenses: 0, savings: 0 },
    { month: 'Feb', expenses: 0, savings: 0 },
    { month: 'Mar', expenses: 0, savings: 0 },
    { month: 'Apr', expenses: 0, savings: 0 },
    { month: 'May', expenses: 0, savings: 0 },
    { month: 'Jun', expenses: 0, savings: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📊 Transaction Analytics</h1>
          <button
            onClick={() => router.push('/atm/dashboard')}
            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-gray-600 mb-2">Total Expenses</p>
            <h3 className="text-3xl font-bold text-red-600">৳{expenses.toLocaleString()}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-gray-600 mb-2">Total Savings</p>
            <h3 className="text-3xl font-bold text-green-600">৳{savings.toLocaleString()}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-gray-600 mb-2">Savings Rate</p>
            <h3 className="text-3xl font-bold text-blue-600">{savingsRate}%</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Expense vs Savings</h3>
            <div className="flex justify-center space-x-8">
               <div>
                 <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center text-white font-bold mx-auto mb-2">{100 - savingsRate}%</div>
                 <p className="text-sm font-bold">Expenses</p>
               </div>
               <div>
                 <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-white font-bold mx-auto mb-2">{savingsRate}%</div>
                 <p className="text-sm font-bold">Savings</p>
               </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Trends</h3>
            <div className="space-y-3">
              {monthlyData.map((data: MonthlyData) => { 
                const maxValue = 40000;
                const expenseWidth = Math.min((data.expenses / maxValue) * 100, 100);
                const savingsWidth = Math.min((data.savings / maxValue) * 100, 100);
                return (
                  <div key={data.month}>
                    <p className="text-xs font-bold text-gray-500 uppercase">{data.month}</p>
                    <div className="flex gap-1">
                      <div className="bg-red-500 h-4 rounded" style={{ width: `${expenseWidth}%` }}></div>
                      <div className="bg-green-500 h-4 rounded" style={{ width: `${savingsWidth}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Financial Insights</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• Total Transactions: {analytics?.totalTransactions || 0}</li>
            <li>• Current Balance: ৳{(analytics?.currentBalance || 0).toLocaleString()}</li>
            <li>• Average Transaction: ৳{(analytics?.averageTransaction || 0).toLocaleString()}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}