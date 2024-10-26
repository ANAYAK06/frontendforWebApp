import React from 'react'
import {Doughnut} from 'react-chartjs-2'
import {Chart as ChartJs} from 'chart.js/auto'

function BudgetChart() {

    
const budgetData = {
    labels: ['Used', 'Remaining'],
    datasets: [
      {
        data: [65, 35],
        backgroundColor: ['#4B5563', '#E5E7EB'],
        borderColor: ['#4B5563', '#E5E7EB'],
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: '70%',
  };
  



  return (

    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Budget Overview</h2>
      <div className="flex items-center justify-center">
        <div className="w-48 h-48 relative">
          <Doughnut data={budgetData} options={options} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-700">65%</p>
              <p className="text-sm text-gray-500">Used</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between text-sm">
        <div>
          <p className="text-gray-500">Total Budget</p>
          <p className="font-semibold text-gray-700">₹100,000</p>
        </div>
        <div>
          <p className="text-gray-500">Remaining</p>
          <p className="font-semibold text-gray-700">₹35,000</p>
        </div>
      </div>
    </div>

  )
}

export default BudgetChart
