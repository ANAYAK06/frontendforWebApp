import React, { useState } from 'react'
import {Chart as ChartJs} from 'chart.js/auto'
import {Line} from 'react-chartjs-2'
import purchaseData from './purchasedata'





function Purchasegraph() {

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
    
<div className='bg-white rounded-lg shadow-md p-6 h-64 m-4 w-96 text-indigo-600'>
  <div>
    <h2 className='font-semibold text-2xl'>PURCHASE</h2>
    <hr />
  </div>
  
<div  >
        <Line data={purcahse} options={options}/>
        
      </div>

</div>

    
  )
}

export default Purchasegraph
