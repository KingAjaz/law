'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { HeroBanner } from '@/components/HeroBanner'
import { 
  Scale, Users, CheckCircle, ArrowRight, Briefcase, 
  Building2, Car, Coffee, Shield, Users2, Phone, Mail,
  Gavel, MessageSquare
} from 'lucide-react'

export default function HomePage() {
  const expertiseAreas = [
    {
      icon: Briefcase,
      title: 'Business Law',
      description: 'Comprehensive legal support for businesses, including contract review, corporate governance, and compliance.',
      featured: true,
    },
    {
      icon: Building2,
      title: 'Construction Law',
      description: 'Expert review of construction contracts, project agreements, and regulatory compliance.',
    },
    {
      icon: Car,
      title: 'Commercial Agreements',
      description: 'Review of commercial contracts, service agreements, and vendor partnerships.',
    },
    {
      icon: Coffee,
      title: 'Employment Contracts',
      description: 'Professional review of employment agreements, NDAs, and workplace legal documents.',
    },
    {
      icon: Shield,
      title: 'Criminal Law',
      description: 'Specialized legal review and consultation for criminal law matters and documentation.',
    },
    {
      icon: Users2,
      title: 'Family Law',
      description: 'Sensitive handling of family law documents, agreements, and legal consultations.',
    },
  ]

  const specializations = [
    { name: 'Contract Reviews', percentage: 90 },
    { name: 'Business Agreements', percentage: 85 },
    { name: 'Employment Contracts', percentage: 80 },
    { name: 'Complex Legal Cases', percentage: 95 },
  ]

  const testimonials = [
    {
      quote: 'LawTech NG provided exceptional contract review services. Their licensed lawyers were thorough and professional.',
      author: 'Sarah Johnson',
      date: 'Mar 15',
      role: 'CEO, Tech Startup',
    },
    {
      quote: 'The platform made it easy to get professional legal review without hiring a full-time lawyer. Highly recommended!',
      author: 'Michael Adebayo',
      date: 'Sep 24',
      role: 'Business Owner',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-brand-600">
      <Navbar />

      {/* Hero Banner with Dynamic Images */}
      <HeroBanner />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4">About Us</h2>
            <div className="w-24 h-1 bg-brand-600 mx-auto mb-6"></div>
            <p className="text-lg text-brand-800 max-w-3xl mx-auto mb-6 leading-relaxed font-medium">
              LawTech NG is a leading platform connecting clients with licensed Nigerian lawyers 
              for professional contract review services. We ensure quality, professionalism, and 
              timely delivery of legal services.
            </p>
            <Link href="/about" className="text-brand-700 font-bold hover:text-brand-600 inline-flex items-center transition-colors border-b-2 border-brand-600 pb-1">
              Read More <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: '500+', label: 'Trusted Clients', sublabel: 'Proven Your Worth Expertise' },
              { number: '1,200+', label: 'Successful Cases', sublabel: 'Exceptional in section' },
              { number: '2,500+', label: 'Contracts Reviewed', sublabel: 'Professional Legal Analysis' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-32 h-32 rounded-full border-4 border-brand-600 mx-auto mb-4 flex items-center justify-center bg-brand-50 shadow-lg">
                  <p className="text-3xl font-bold text-brand-700">{stat.number}</p>
                </div>
                <h3 className="text-xl font-bold text-brand-800 mb-2">{stat.label}</h3>
                <p className="text-brand-700 text-sm font-semibold">{stat.sublabel}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Explore Our Expertise Areas
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-white/90 text-lg">
                Our licensed lawyers specialize in various areas of law, providing comprehensive 
                contract review and legal consultation services tailored to your needs.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertiseAreas.map((area, index) => {
              const IconComponent = area.icon
              return (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-beige hover:border-white/30 transition-all"
              >
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{area.title}</h3>
                <p className="text-white/80 mb-4 text-sm">{area.description}</p>
                <Link
                  href="/services"
                  className={`inline-block text-sm font-medium ${
                    area.featured
                      ? 'text-white hover:text-white/80'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Learn More →
                </Link>
              </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="hidden lg:block"
            >
              <div className="w-full h-96 bg-gradient-to-br from-gold-600/20 to-gold-800/10 rounded-2xl border border-gold-600/30 flex items-center justify-center">
                <Gavel className="w-48 h-48 text-gold-500/40" strokeWidth={0.5} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                We Are Specialised And Experienced
              </h2>
              <p className="text-white/90 mb-8 text-lg">
                Our team of licensed lawyers brings years of experience and specialized knowledge 
                to every contract review, ensuring comprehensive analysis and professional recommendations.
              </p>

              <div className="space-y-6">
                {specializations.map((spec, index) => (
                  <motion.div
                    key={spec.name}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-white font-medium">{spec.name}</span>
                      <span className="text-white font-semibold">{spec.percentage}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${spec.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-white rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <Link href="/signup" className="btn btn-primary mt-8 inline-block">
                Get Free Consult
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Testimonials</h2>
            <div className="w-24 h-1 bg-white mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-beige"
              >
                <MessageSquare className="h-12 w-12 text-white mb-4" />
                <p className="text-white/90 mb-6 text-lg leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{testimonial.author}</p>
                    <p className="text-white/70 text-sm">{testimonial.date} • {testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Our Expert Professional Law Team is Always Ready to Serve You the Best Solution!
              </h2>
              <Link href="/signup" className="btn btn-primary text-lg px-8 py-4 inline-block">
                Contact Us
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card bg-white border-brand-300 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Scale className="h-8 w-8 text-brand-700" />
                <span className="text-2xl font-bold text-brand-700">LawTech NG</span>
              </div>
              <h3 className="text-2xl font-bold text-brand-800 mb-6">Get a Free Consultation</h3>
              <div className="flex items-center gap-3">
                <Phone className="h-6 w-6 text-brand-600" />
                <span className="text-brand-700 font-semibold">+234 XXX XXX XXXX</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
