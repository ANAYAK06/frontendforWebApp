import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';

function CustomDatePicker({ 
  selectedDate, 
  onChange, 
  label, 
  minDate,
  maxDate,
  placeholder = "Select date",
  disabled = false
}) {
  // Convert UTC date string to local Date object for display
  const getLocalDateFromUTC = (utcDate) => {
    if (!utcDate) return null;
    const date = new Date(utcDate);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  };

  // Convert local Date to UTC string for storage
  const getUTCFromLocalDate = (localDate) => {
    if (!localDate) return null;
    const date = new Date(localDate);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
  };

  const handleDateChange = (date) => {
    if (date) {
      // Set to start of day in local timezone
      const localDate = new Date(date);
      localDate.setHours(0, 0, 0, 0);
      // Convert to UTC before calling parent's onChange
      onChange(getUTCFromLocalDate(localDate));
    } else {
      onChange(null);
    }
  };

  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <div className="relative w-full">
      <input
        ref={ref}
        value={value}
        onClick={onClick}
        className={`
          w-full px-3 py-2 pl-10 bg-white border rounded-md
          focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
          hover:border-indigo-300 transition-colors duration-200
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        placeholder={placeholder}
        readOnly
      />
      <FaCalendarAlt 
        className={`absolute left-3 top-1/2 -translate-y-1/2 
          ${disabled ? 'text-gray-400' : 'text-indigo-500'}`
        }
      />
    </div>
  ));

  CustomInput.displayName = 'CustomInput';

  // Convert UTC string to local Date for DatePicker
  const normalizedSelectedDate = selectedDate ? getLocalDateFromUTC(selectedDate) : null;
  
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <DatePicker
        selected={normalizedSelectedDate}
        onChange={handleDateChange}
        dateFormat="dd/MM/yyyy"
        minDate={minDate ? getLocalDateFromUTC(minDate) : undefined}
        maxDate={maxDate ? getLocalDateFromUTC(maxDate) : undefined}
        disabled={disabled}
        placeholderText={placeholder}
        className="w-full"
        wrapperClassName="w-full"
        customInput={<CustomInput />}
        calendarClassName="shadow-lg border-gray-200"
        dayClassName={date =>
          date.getDate() === normalizedSelectedDate?.getDate() &&
          date.getMonth() === normalizedSelectedDate?.getMonth()
            ? "bg-indigo-500 text-white rounded-full hover:bg-indigo-600"
            : undefined
        }
        renderCustomHeader={({
          date,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled,
        }) => (
          <div className="flex items-center justify-between px-2 py-2">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              type="button"
              className={`
                p-1 rounded-full hover:bg-gray-100
                ${prevMonthButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-gray-800">
              {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              type="button"
              className={`
                p-1 rounded-full hover:bg-gray-100
                ${nextMonthButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      />
      <style>{`
        .react-datepicker {
          font-family: inherit;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }
        
        .react-datepicker__header {
          background-color: white;
          border-bottom: 1px solid #e5e7eb;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          padding-top: 0.5rem;
        }
        
        .react-datepicker__day {
          width: 2rem;
          line-height: 2rem;
          margin: 0.2rem;
          border-radius: 9999px;
        }
        
        .react-datepicker__day:hover {
          background-color: #e0e7ff;
          border-radius: 9999px;
        }
        
        .react-datepicker__day--selected {
          background-color: #6366f1 !important;
          color: white !important;
        }
        
        .react-datepicker__day--keyboard-selected {
          background-color: #e0e7ff;
          border-radius: 9999px;
        }
        
        .react-datepicker__day--outside-month {
          color: #9ca3af;
        }
        
        .react-datepicker__triangle {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default CustomDatePicker;