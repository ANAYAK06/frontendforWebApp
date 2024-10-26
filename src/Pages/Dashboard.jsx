import React from 'react'
import Quicklink from '../Components/Quicklink'
import GraphComponent from '../Components/GraphComponent'
import ProjectStatus from '../Components/ProjectStatus';
import BudgetChart from '../Components/BudgetChart';
import RecentTransactions from '../Components/RecentTransactions';

function Dashboard() {
  const purchaseData = {
    labels: [ 'Apr', 'May', 'Jun', 'Jul','Aug','Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    datasets: [{
      data: [65, 59, 80, 81, 56, 55],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    }]
  };

  const salesData = {
    labels: ['Apr', 'May', 'Jun', 'Jul','Aug','Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    datasets: [{
      data: [54, 67, 41, 55, 62, 45],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
    }]
  };



  return (
    
    
    <div className="p-6 bg-gray-100 mt-1">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Quicklink />
        <GraphComponent title="PURCHASE" data={purchaseData} bgColor="bg-blue-50" />
        <GraphComponent title="SALES" data={salesData} bgColor="bg-pink-50" />
        <ProjectStatus/>
        <BudgetChart/>
        <RecentTransactions/>
      </div>
    </div>
   
    
  )
}

export default Dashboard
