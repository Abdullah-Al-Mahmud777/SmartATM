'use client';

import { useRouter } from 'next/navigation';

export default function Analytics() {
  const router = useRouter();

  const expenses = 35000;
  const savings = 15000;
  const total = expenses + savings;
  const savingsRate = Math.round((savings / total) * 100);

  const monthlyData = [
    { month: 'Jan', expenses: 12000, savings: 8000 },
    { month: 'Feb', expenses: 19000, savings: 11000 },
    { month: 'Mar', expenses: 15000, savings: 13000 },
    { month: 'Apr', expenses: 25000, savings: 15000 },
    { month: 'May', expenses: 22000, savings: 18000 },
    { month: 'Jun', expenses: 35000, savings: 15000 },
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
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-gray-600 mb-2">Total Expenses</p>
            <h3 className="text-3xl font-bold text-red-600">৳{expenses.toLocaleString()}</h3>
            <p className="text-sm text-gray-500 mt-2">This month</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-gray-600 mb-2">Total Savings</p>
            <h3 className="text-3xl font-bold text-green-600">৳{savings.toLocaleString()}</h3>
            <p className="text-sm text-gray-500 mt-2">This month</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-gray-600 mb-2">Savings Rate</p>
            <h3 className="text-3xl font-bold text-blue-600">{savingsRate}%</h3>
            <p className="text-sm text-gray-500 mt-2">Of total income</p>
          </div>
        </div>

        {/* Visual Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart Alternative */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Expense vs Savings</h3>
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-2xl mb-2">
                  70%
                </div>
                <p className="text-gray-700 font-semibold">Expenses</p>
                <p className="text-gray-600">৳{expenses.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-2xl mb-2">
                  30%
                </div>
                <p className="text-gray-700 font-semibold">Savings</p>
                <p className="text-gray-600">৳{savings.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Bar Chart Alternative */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Trends</h3>
            <div className="space-y-3">
              {monthlyData.map((data) => {
                const maxValue = 40000;
                const expenseWidth = (data.expenses / maxValue) * 100;
                const savingsWidth = (data.savings / maxValue) * 100;
                return (
                  <div key={data.month}>
                    <p className="text-sm font-semibold text-gray-700 mb-1">{data.month}</p>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-red-500 h-full flex items-center justify-end pr-2"
                            style={{ width: `${expenseWidth}%` }}
                          >
                            <span className="text-xs text-white font-semibold">
                              ৳{data.expenses.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-green-500 h-full flex items-center justify-end pr-2"
                            style={{ width: `${savingsWidth}%` }}
                          >
                            <span className="text-xs text-white font-semibold">
                              ৳{data.savings.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span className="text-sm text-gray-700">Expenses</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-700">Savings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-blue-50 p-6 rounded-xl">
          <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Financial Insights</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Your expenses increased by 15% compared to last month</li>
            <li>• You saved {savingsRate}% of your income this month - Great job!</li>
            <li>• Most spending: Transfers (45%), Withdrawals (35%)</li>
            <li>• Tip: Try to increase savings to 40% next month</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
