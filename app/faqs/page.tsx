'use client'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, MessageCircle } from 'lucide-react'

const faqs = [
  {
    question: 'Who reviews my contract?',
    answer: 'All contracts are reviewed exclusively by licensed Nigerian lawyers. We do not use AI or automation for contract review. Every review is performed by a qualified legal professional.',
  },
  {
    question: 'How long does a review take?',
    answer: 'Review times vary by pricing tier: Basic (5-7 business days), Standard (3-5 business days), and Premium (1-3 business days).',
  },
  {
    question: 'What file formats do you accept?',
    answer: 'We accept PDF and DOCX file formats for contract uploads.',
  },
  {
    question: 'Is my information secure?',
    answer: 'Yes, we use encrypted file storage and secure authentication. All documents are stored securely and only accessible to you and the assigned lawyer.',
  },
  {
    question: 'Can I delete my uploaded documents?',
    answer: 'Yes, you can delete your uploaded documents at any time from your dashboard.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept payments via Paystack, which supports bank transfers, cards, and other payment methods in Nigeria.',
  },
  {
    question: 'What happens after I upload a contract?',
    answer: 'After uploading and payment confirmation, an admin will assign your contract to a licensed lawyer. The lawyer will review it and upload the reviewed document for you to download.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'Refund policies are handled on a case-by-case basis. Please contact support for refund requests.',
  },
]

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'bot'; message: string }>>([])
  const [inputMessage, setInputMessage] = useState('')

  const handleChatbotSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage = inputMessage
    setInputMessage('')
    setChatMessages((prev) => [...prev, { role: 'user', message: userMessage }])

    // Simple FAQ chatbot (AI for FAQ only, as per requirements)
    setTimeout(() => {
      const lowerMessage = userMessage.toLowerCase()
      let botResponse = "I'm here to help with FAQs about our contract review service. Could you please rephrase your question?"

      if (lowerMessage.includes('review') || lowerMessage.includes('how long')) {
        botResponse = 'Review times vary by tier: Basic (5-7 days), Standard (3-5 days), Premium (1-3 days). All reviews are done by licensed lawyers.'
      } else if (lowerMessage.includes('lawyer') || lowerMessage.includes('who')) {
        botResponse = 'All contracts are reviewed exclusively by licensed Nigerian lawyers. No AI is used for contract review.'
      } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
        botResponse = 'We accept payments via Paystack (bank transfers, cards). Payment is required before contract review begins.'
      } else if (lowerMessage.includes('format') || lowerMessage.includes('file')) {
        botResponse = 'We accept PDF and DOCX file formats for contract uploads.'
      } else if (lowerMessage.includes('secure') || lowerMessage.includes('privacy')) {
        botResponse = 'Yes, we use encrypted storage and secure authentication. Your documents are only accessible to you and the assigned lawyer.'
      }

      setChatMessages((prev) => [...prev, { role: 'bot', message: botResponse }])
    }, 500)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600">
              Find answers to common questions about our contract review service
            </p>
          </motion.div>

          <div className="space-y-4 mb-16">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex justify-between items-center text-left"
                >
                  <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                  <ChevronDown
                    className={`h-5 w-5 text-primary-700 transition-transform flex-shrink-0 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 text-gray-600"
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>

          {/* FAQ Chatbot */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="card bg-primary-50 border-primary-200"
          >
            <div className="flex items-center mb-4">
              <MessageCircle className="h-6 w-6 text-primary-700 mr-2" />
              <h2 className="text-2xl font-semibold">FAQ Chatbot</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Ask questions about our service. This chatbot uses AI for FAQ assistance only.
            </p>

            <div className="bg-white rounded-lg p-4 mb-4 h-64 overflow-y-auto space-y-3">
              {chatMessages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Start a conversation...</p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-primary-700 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleChatbotSubmit} className="flex gap-2" aria-label="FAQ chatbot">
              <label htmlFor="faq-input" className="sr-only">
                Ask a question
              </label>
              <input
                id="faq-input"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question..."
                className="input flex-1"
                aria-label="FAQ question input"
              />
              <button type="submit" className="btn btn-primary" aria-label="Send question">
                Send
              </button>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
