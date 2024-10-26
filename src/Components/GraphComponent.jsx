import React from 'react'
import {Line} from 'react-chartjs-2'
import {Chart as ChartJs} from 'chart.js/auto'

function GraphComponent({title, data, bgColor}) {

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { grid: { display: false } },
          y: { 
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: { callback: (value) => `₹${value}k` }
          }
        },
        elements: {
          line: { tension: 0.4 },
          point: { radius: 0 }
        }
      };


  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 h-full ${bgColor}`}>
    <h2 className='text-xl font-bold mb-4 text-gray-800'>{title}</h2>
    <div className='h-48'>
      <Line data={data} options={options} />
    </div>
  </div>
    
  )
}

export default GraphComponent
