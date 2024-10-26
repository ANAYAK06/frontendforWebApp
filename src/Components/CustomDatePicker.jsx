import React from 'react'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function CustomDatePicker({ selectedDate, onChange, label}) {
  return (
    <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <DatePicker
      selected={selectedDate}
      onChange={onChange}
      dateFormat="dd/MM/yyyy"
      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      wrapperClassName="w-full"
      popperClassName="react-datepicker-right"
      customInput={
        <input
          type="text"
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      }
    />
  </div>
  )
}

export default CustomDatePicker
