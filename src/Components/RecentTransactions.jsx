import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const transactions = [
  { id: 1, description: 'Payment from Client A', amount: 5000, type: 'income' },
  { id: 2, description: 'Server Costs', amount: 1000, type: 'expense' },
  { id: 3, description: 'Office Supplies', amount: 250, type: 'expense' },
  { id: 4, description: 'Payment from Client B', amount: 3500, type: 'income' },
  { id: 5, description: 'Software Licenses', amount: 800, type: 'expense' },
];

function RecentTransactions() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Transactions</h2>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={`p-2 rounded-full mr-3 ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                {transaction.type === 'income' ? (
                  <FaArrowUp className="text-green-600" />
                ) : (
                  <FaArrowDown className="text-red-600" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-700">{transaction.description}</p>
                <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentTransactions;