import React, { useState, useEffect, useRef } from 'react'
import { X, MessageCircle, Send } from 'lucide-react'
import { Button } from '../ui/button'
import { chatbotKnowledge, getNodeById, hasOptions, getBackButton, getStartOverButton } from './chatbotKnowledge.jsx'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [history, setHistory] = useState(['greeting'])
  const [isAnimating, setIsAnimating] = useState(false)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = getNodeById('greeting')
      setMessages([{
        id: Date.now(),
        content: greeting.message,
        type: 'bot',
        options: greeting.options,
        timestamp: new Date()
      }])
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle opening chat with animation
  const handleOpen = () => {
    setIsOpen(true)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 500)
  }

  // Handle option click
  const handleOptionClick = (optionId) => {
    const node = getNodeById(optionId)
    
    if (!node) return

    // Add user's choice to messages
    const userMessage = {
      id: Date.now(),
      content: node.message || optionId,
      type: 'user-choice',
      timestamp: new Date()
    }

    // Add bot response
    const botMessage = {
      id: Date.now() + 1,
      content: node.message,
      type: 'bot',
      options: node.options,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage, botMessage])
    setHistory(prev => [...prev, optionId])
  }

  // Handle back button
  const handleBack = () => {
    if (history.length <= 1) return

    const newHistory = [...history]
    newHistory.pop() // Remove current
    const previousId = newHistory[newHistory.length - 1]
    
    setHistory(newHistory)
    
    // Rebuild messages from history
    const newMessages = []
    newHistory.forEach(nodeId => {
      const node = getNodeById(nodeId)
      if (node) {
        newMessages.push({
          id: Date.now() + Math.random(),
          content: node.message,
          type: 'bot',
          options: node.options,
          timestamp: new Date()
        })
      }
    })
    
    setMessages(newMessages)
  }

  // Handle start over
  const handleStartOver = () => {
    const greeting = getNodeById('greeting')
    setMessages([{
      id: Date.now(),
      content: greeting.message,
      type: 'bot',
      options: greeting.options,
      timestamp: new Date()
    }])
    setHistory(['greeting'])
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open chat"
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
            
            {/* Button */}
            <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="h-8 w-8 text-white animate-bounce" />
            </div>
            
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-slate-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
              Hi! Need help? 👋
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden ${isAnimating ? 'animate-in slide-in-from-bottom-4 fade-in duration-500' : ''}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="text-white font-bold">EyeBot</h3>
                <p className="text-white/80 text-xs">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
          >
            {messages.map((message, index) => (
              <div key={message.id}>
                {message.type === 'bot' ? (
                  <div className="flex items-start space-x-2 animate-in slide-in-from-left fade-in duration-300">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">🤖</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-slate-200">
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                          {message.content}
                        </p>
                      </div>
                      
                      {/* Options */}
                      {message.options && message.options.length > 0 && index === messages.length - 1 && (
                        <div className="mt-3 space-y-2">
                          {message.options.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => handleOptionClick(option.id)}
                              className="w-full text-left px-4 py-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all duration-200 flex items-center space-x-2 group"
                            >
                              <span className="text-lg">{option.icon}</span>
                              <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">
                                {option.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-2 justify-end animate-in slide-in-from-right fade-in duration-300">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl rounded-tr-none p-4 shadow-sm max-w-[80%]">
                      <p className="text-white text-sm">
                        {message.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Navigation Buttons */}
            {messages.length > 1 && (
              <div className="flex gap-2 pt-2">
                {history.length > 1 && (
                  <button
                    onClick={handleBack}
                    className="flex-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={handleStartOver}
                  className="flex-1 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
                >
                  🏠 Start Over
                </button>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-slate-200">
            <p className="text-xs text-center text-slate-500">
              Powered by UrbanEye AI • Always learning to serve you better
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot
