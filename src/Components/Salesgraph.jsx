import React, { useState } from 'react'
import {Chart as ChartJs} from 'chart.js/auto'
import {Line} from 'react-chartjs-2'
import purchaseData from './purchasedata'


function Salesgraph() {

  const [purcahse, setPurchase] =useState({
    labels: purchaseData.map((data)=>data.month),
    datasets : [{
      label:"Purcahse",
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      data: purchaseData.map((data)=>data.purchase)
    }]
  });

  const options = {
    plugins: {
      legend: {
        display: false // Hide legend
      }
    },
    scales: {
      x: {
        display: true, // Show x-axis
        grid: {
          display: false // Hide x-axis grid lines
        }
      },
      y: {
        display: true, // Show y-axis
        grid: {
          display: false // Hide y-axis grid lines
        }
      }
    }
  };




  return (
    <div className='rounded-lg shadow-md p-6 h-64 m-4 w-96 text-indigo-600 bg-green-200 hover:translate-y-2 hover:transform duration-300 cursor-pointer'>
      <div>
        <h2 className='font-semibold text-2xl'>SALES</h2>
        <hr />
      </div>
      <div>
        <Line data={purcahse} options={options}/>
      </div>
      
    </div>
  )
}

export default Salesgraph
