import React from 'react'
import Quicklink from '../Components/Quicklink'
import Purchasegraph from '../Components/Purchasegraph'
import Salesgraph from '../Components/Salesgraph'

function Dashboard() {
  return (
    <>
    
        <div className='flex ml-5 left-20'>
      <Quicklink/>
      <Purchasegraph/>
      <Salesgraph/>
    </div>
   
    </>
  )
}

export default Dashboard
