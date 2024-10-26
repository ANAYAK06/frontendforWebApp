import React from 'react'
import { IoChatbubbleEllipses } from "react-icons/io5"
function TrackbotIcon({onClick}) {
  return (
    <button 
      onClick={onClick}
      className="fixed right-4 bottom-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 animate-bounce"
      aria-label="Open chat bot"
    >
      <IoChatbubbleEllipses size={24} />
    </button>
  )
}

export default TrackbotIcon
