import React from 'react'
import { TbTableShortcut } from "react-icons/tb";
import { IoMdAddCircleOutline } from "react-icons/io";

function Quicklink() {
  return (
    <div className='bg-white rounded-lg shadow-lg p-6 h-full'>
    <h2 className='text-xl font-bold mb-4 text-gray-800'>Quick Links</h2>
    <ul className='space-y-3'>
      {['Budget Report', 'Financial Statement', 'Inventory Summary'].map((link, index) => (
        <li key={index} className='flex items-center group'>
          <TbTableShortcut className='w-5 h-5 mr-3 text-indigo-600 group-hover:text-indigo-800 transition-colors duration-200' />
          <a href='#' className='text-gray-700 hover:text-indigo-600 transition-colors duration-200'>{link}</a>
        </li>
      ))}
    </ul>
    <button className='mt-6 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200'>
      <IoMdAddCircleOutline className='w-5 h-5 mr-2' />
      Add More Links
    </button>
  </div>
  )
}

export default Quicklink
