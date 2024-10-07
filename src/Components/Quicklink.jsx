import React from 'react'
import { TbTableShortcut } from "react-icons/tb";
import { IoMdAddCircleOutline } from "react-icons/io";

function Quicklink() {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 w-64 h-64 m-4'>
        <h2 className='text-xl-1 font-semibold mb-4 text-blue'>Quick Links</h2>
        <hr />
        <ul>
            <li className='space-y-2 inline-flex items-center'>
            <TbTableShortcut className='w-6 h-6 mr-2 text-blue'/>
            
                <a href='' className='text-blue hover:text-gray-700 transition duration-300 cursor-pointer hover:underline'>Budget Report</a> 
            </li>
            <li className='space-y-2 inline-flex items-center'>
            <TbTableShortcut className='w-6 h-6 mr-2 text-blue'/>
            
                <a className='text-blue hover:text-gray-700 transition duration-300 cursor-pointer hover:underline'>Budget Report</a> 
            </li>
            <li className='space-y-2 inline-flex items-center'>
            <TbTableShortcut className='w-6 h-6 mr-2 text-blue'/>
            
                <a className='text-blue hover:text-gray-700 transition duration-300 cursor-pointer hover:underline'>Budget Report</a> 
            </li>
        </ul>
        <div>
        
        Add More Links
        <IoMdAddCircleOutline />
        </div>
      
    </div>
  )
}

export default Quicklink
