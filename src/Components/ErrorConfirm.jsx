import React from 'react'
import { BiError } from "react-icons/bi";

function ErrorConfirm({message, onCancel, title}) {
  return (
    <div className='fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10'>
        <div className='bg-white rounded-lg p-8 max-w-md w-full fade-in'>
        <h2 className='text-lg font-semibold mb-4'>{title}</h2>
            <div>
            <BiError className='rounded text-4xl text-red-700' />

            </div>
            <p className='text-gray-700 mb-8'>{message}</p>
            <div className='flex justify-end'>
                <button className='mr-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded'
                onClick={onCancel}
                >Close</button>
               

            </div>

        </div>
      
    </div>
  )
}

export default ErrorConfirm
