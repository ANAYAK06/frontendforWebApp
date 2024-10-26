import React, { useEffect, useRef, useState } from 'react'
import { IoClose, IoHandRight, IoRemove, IoSend } from "react-icons/io5";
import TrackbotIcon from './TrackbotIcon';

function Trackchatbot() {


  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [showTransactions, setShowTransactions]= useState(false)

  const messagesEndRef = useRef(null)

  useEffect(()=>{
    if(isOpen){
      setMessages([
        {type:'bot', content: "Hi, I'm Trackbot! What would you like to track?"}
      ])
      setShowTransactions(true)
    }
  },[isOpen])
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages]);

  const dummyTransactions = [
    { id: 1, name: 'Bank Voucher' },
    { id: 2, name: 'CC Budget' },
    { id: 3, name: 'DCA Budget'},
  ];

  const handleSendMessage  = () => {
    if(inputMessage.trim()) {
      setMessages(prevMessages => [...prevMessages, {type:'user', content:inputMessage}])
      setInputMessage('')
      setShowTransactions(false)
    }
  }

  const handleTransactionClick = (transaction) => {
    setMessages(prevMessages => [
      ...prevMessages,
      { type: 'user', content: `Track ${transaction.name}` },
      { type: 'bot', content: `Sure, I can help you track ${transaction.name}. What details would you like to know?` }
    ]);
    setShowTransactions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleTrackbot = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }
 
  if(!isOpen) return <TrackbotIcon onClick={toggleTrackbot} />


  return (
    <div className={`fixed right-4 bottom-5 w-96 bg-white shadow-lg transition-all duration-300 ease-in-out ${isMinimized ? 'h-14' : 'h-[calc(100vh-6rem)] max-h-[600px]'} animate-slide-up `}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-indigo-600 text-white rounded-t-lg">
        <h2 className="text-lg font-semibold  animate-pulse">TrackBot</h2>
        <div className="flex space-x-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="hover:text-gray-300 transition-colors duration-200">
            <IoRemove size={20} className="transform hover:scale-110 transition-transform duration-200" />
          </button>
          <button onClick={toggleTrackbot} className="hover:text-gray-300 transition-colors duration-200">
            <IoClose size={20} className="transform hover:scale-110 transition-transform duration-200"  />
          </button>
        </div>
      </div>
            {/* Chat area */}
      {!isMinimized && (
        <div className="flex flex-col h-[calc(100%-56px)] ">
          <div className="flex-grow p-4 overflow-y-auto space-y-2">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' :'justify-start'} animate-fade-in`}>
                <div className={`max-w-[70%] p-3 rounded-lg ${message.type === 'user' ? 'bg-indigo-100 text-indigo-900': 'bg-gray-200 text-gray-900'} animate-message-appear`}>
                  {message.type === 'bot' && index === 0 && (
                    <IoHandRight className=' inline-block mr-2 animate-wave text-yellow-500' />
                  )

                  }
                  {message.content}

                </div>

              </div>
            ))}
            {showTransactions && (
              <div className=' space-y-2 mt-4 animate-fade-in'>
                <p className='text-sm text-gray-600'>Available Transactions:</p>
                {dummyTransactions.map((transaction, index) => (
                  <button key={transaction.id}
                  onClick={() =>handleTransactionClick(transaction)}
                  className=' block w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded transition duration-150 ease-in-out'
                  style={{animationDelay: `${index * 100}ms`}}>
                    <span className='font-medium'>{transaction.name}</span>

                  </button>
                ))}

              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-2 bg-gray-100 border-t border-gray-200 rounded-b-lg animate-slide-up">
            <div className=' flex items-center space-x-2'>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className=" flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition-all duration-200 hover:shadow-md"
              onKeyDown={handleKeyDown}
            />
            <button
            onClick={handleSendMessage}
            className='p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 hover:shadow-md transform hover:scale-105'>
              <IoSend size={20}/>

            </button>

            </div>
           
          </div>
        </div>
      )}
    </div>
  )
}

export default Trackchatbot
