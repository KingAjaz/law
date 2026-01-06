'use client'

import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      toast.success('Message sent successfully! We will get back to you soon.')
      setFormData({ name: '', company: '', email: '', phone: '', service: '', message: '' })
      setSubmitting(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4">
              Let's Move Your Legal Work Forward
            </h1>
            <p className="text-lg md:text-xl text-brand-700 leading-relaxed max-w-3xl mx-auto">
              Whether you are ready to upload a contract, need a custom quote, or want to talk strategy —
              we are here to help.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card"
            >
              <Mail className="h-8 w-8 text-brand-600 mb-4" />
              <h3 className="text-xl font-bold text-brand-700 mb-2">Email</h3>
              <p className="text-brand-700 font-medium">support@legalease.com</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card"
            >
              <Phone className="h-8 w-8 text-brand-600 mb-4" />
              <h3 className="text-xl font-bold text-brand-700 mb-2">Phone</h3>
              <p className="text-brand-700 font-medium">+234 XXX XXX XXXX</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card md:col-span-2"
            >
              <MapPin className="h-8 w-8 text-brand-600 mb-4" />
              <h3 className="text-xl font-bold text-brand-700 mb-2">Address</h3>
              <p className="text-brand-700 font-medium">Lagos, Nigeria</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card"
          >
            <h2 className="text-2xl font-bold text-brand-700 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-brand-700">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-brand-700">Company</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="input"
                  placeholder="Your company name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-brand-700">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-brand-700">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  placeholder="Your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-brand-700">Service Interested In</label>
                <select
                  required
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="input"
                >
                  <option value="">Select a service</option>
                  <option value="contract-review">Contract Review</option>
                  <option value="fractional-gc">Fractional General Counsel</option>
                  <option value="recruitment-training">Recruitment & Training</option>
                  <option value="custom-quote">Custom Quote</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-brand-700">Message</label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input"
                  placeholder="Your message here..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary-beige w-full"
              >
                {submitting ? 'Sending...' : (
                  <>
                    Send Message
                    <Send className="ml-2 h-4 w-4 inline" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
