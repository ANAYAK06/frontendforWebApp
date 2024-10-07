import React from 'react'
import { CiWarning } from "react-icons/ci";

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className={` fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10`}>
      <div className='bg-white rounded-lg p-8 max-w-md w-full fade-in'>
        <h2 className='text-lg font-semibold mb-4'>{title}</h2>
        <div>
          <CiWarning className='rounded text-yellow-600 text-6xl' />
        </div>
        <p className='text-gray-700 mb-8'>{message}</p>
        <div className='flex justify-end'>
          <button className='mr-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded'
            onClick={onCancel}
          >Cancel</button>
          <button
            className='bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded'
            onClick={onConfirm}
          >
            Confirm
          </button>

        </div>

      </div>

    </div>
  )
}

export default ConfirmModal
