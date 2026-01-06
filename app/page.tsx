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
  Gavel, MessageSquare, Rocket, Building, Zap, Upload, FileText, Lightbulb
} from 'lucide-react'

export default function HomePage() {
  const expertiseAreas = [
    {
      icon: Rocket,
      title: 'Startups & Founder Teams',
      description: 'Get expert contract review and legal guidance without a full-time GC.',
    },
    {
      icon: Building,
      title: 'In-House Legal Teams',
      description: 'Offload routine contract work and scale efficiently.',
    },
    {
      icon: Briefcase,
      title: 'Law Firms & Legal Departments',
      description: 'Outsource overflow review work so you can focus on more strategic matters.',
    },
    {
      icon: Zap,
      title: 'Fintech & Technology Players',
      description: 'Legal clarity that keeps deals moving and risk controlled.',
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
      quote: 'LegalEase provided exceptional contract review services. Their licensed lawyers were thorough and professional.',
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
    <div className="min-h-screen flex flex-col bg-white">
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
            <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-6">
              Legal Support That Works the Way You Do
            </h2>
            <div className="w-24 h-1 bg-brand-600 mx-auto mb-6"></div>
            <p className="text-lg md:text-xl text-brand-800 max-w-3xl mx-auto mb-8 leading-relaxed font-medium">
              Legalease provides on-demand contract review and fractional GC services tailored for the
              fintech, finance, and technology sectors. We help you manage legal workloads with specialists
              who understand your industry, so your team can focus on strategy, growth, and execution.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Contract review for NDAs, SLAs, MSAs, service agreements, and key operational contracts
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Fractional general counsel — compliance, risk, governance, and strategic advisory
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  In-house legal team recruitment & training
                </p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Transparent pricing, reliable delivery, secure communication
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/services"
              className="btn btn-primary-beige text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Explore Our Services
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4">
              Solutions for Every Stage of Growth
            </h2>
            <div className="w-24 h-1 bg-brand-600 mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {expertiseAreas.map((area, index) => {
              const IconComponent = area.icon
              return (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card hover:border-brand-500 transition-all"
              >
                <div className="w-16 h-16 bg-brand-500 rounded-lg flex items-center justify-center mb-4">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-brand-700 mb-3">{area.title}</h3>
                <p className="text-brand-700 mb-4 text-base leading-relaxed">{area.description}</p>
              </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/services"
              className="btn btn-primary-beige text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Learn More About Your Use Case
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4">
              How It Works
            </h2>
            <div className="w-24 h-1 bg-brand-600 mx-auto mb-4"></div>
            <p className="text-xl text-brand-700 font-medium">
              A Clear, Efficient Legal Workflow
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-brand-700 mb-3">
                Upload your contract
              </h3>
              <p className="text-brand-700 leading-relaxed">
                Select type & turnaround.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-brand-700 mb-3">
                Review & analysis
              </h3>
              <p className="text-brand-700 leading-relaxed">
                Delivered with actionable insights.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-brand-700 mb-3">
                Strategic support
              </h3>
              <p className="text-brand-700 leading-relaxed">
                Optional counsel, governance input or training.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/signup"
              className="btn btn-primary-beige text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              <Upload className="h-5 w-5" />
              Upload Contract
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4">
              Industry Experience You Can Trust
            </h2>
            <div className="w-24 h-1 bg-brand-600 mx-auto mb-6"></div>
            <p className="text-lg md:text-xl text-brand-700 leading-relaxed max-w-4xl mx-auto">
              Our team has decades of combined legal experience with leading fintech unicorns, international
              law firms, and investment companies — locally and cross-border. We've supported C-suite
              executives, in-house legal teams, and fast-scaling tech businesses with real legal work.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4">
              About Us
            </h2>
            <div className="w-24 h-1 bg-brand-600 mx-auto mb-6"></div>
            <h3 className="text-2xl md:text-3xl font-semibold text-brand-700 mb-8">
              Built for Tech, Fintech & Modern Legal Teams
            </h3>
            <div className="max-w-4xl mx-auto space-y-6">
              <p className="text-lg md:text-xl text-brand-700 leading-relaxed">
                Legalease was created to solve a real problem: legal teams and founders burdened by recurring
                contract reviews and operational legal work while strategic priorities wait on the sidelines. We
                combine domain expertise in fintech and technology with a flexible delivery model that feels like
                an extension of your team, not a traditional law firm.
              </p>
              <p className="text-lg md:text-xl text-brand-700 leading-relaxed">
                We value clarity, responsiveness, and deep industry knowledge — because legal should
                accelerate your business, not slow it down.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/about"
              className="btn btn-primary-beige text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Learn More
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4">
              Services / Expertise
            </h2>
            <div className="w-24 h-1 bg-brand-600 mx-auto mb-6"></div>
            <h3 className="text-2xl md:text-3xl font-semibold text-brand-700 mb-4">
              On-Demand Contract Review
            </h3>
            <p className="text-xl md:text-2xl text-brand-700 font-medium mb-8">
              Precise Contract Reviews — Fast Turnaround
            </p>
            <p className="text-lg md:text-xl text-brand-700 leading-relaxed max-w-4xl mx-auto mb-8">
              We focus on the contracts that matter to your operations. We review operational agreements
              such as:
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-8"
          >
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  NDAs & Confidentiality Agreements
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Service Level Agreements (SLAs)
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Master Service Agreements (MSAs)
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Vendor & Partnership Agreements
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Other operational documents
                </p>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-lg md:text-xl text-brand-700 leading-relaxed max-w-4xl mx-auto mb-8">
              Our reviews give you clear summaries, risk flags, and concise advice — all delivered securely
              on your schedule.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/signup"
              className="btn btn-primary-beige text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Request Contract Review
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4">
              Fractional General Counsel
            </h2>
            <div className="w-24 h-1 bg-brand-600 mx-auto mb-6"></div>
            <h3 className="text-2xl md:text-3xl font-semibold text-brand-700 mb-4">
              Strategic Counsel — Fractional & Scalable
            </h3>
            <p className="text-lg md:text-xl text-brand-700 leading-relaxed max-w-4xl mx-auto mb-8">
              Not ready for a full-time GC? We provide flexible counsel for:
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-12"
          >
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Regulatory advisory
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Contract review
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Legal strategy
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Data and IP Protection
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Cross-functional risk alignment
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Legal operations
                </p>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/signup"
              className="btn btn-primary-beige text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Engage a Fractional Counsel
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4">
              Recruitment & Training
            </h2>
            <div className="w-24 h-1 bg-brand-600 mx-auto mb-6"></div>
            <h3 className="text-2xl md:text-3xl font-semibold text-brand-700 mb-4">
              Grow Your Legal Team — With Support
            </h3>
            <p className="text-lg md:text-xl text-brand-700 leading-relaxed max-w-4xl mx-auto mb-8">
              Need to recruit or train your in-house legal team? We support you with:
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-12"
          >
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Hiring guidance for legal roles
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Onboarding and training frameworks
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-brand-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-brand-700 leading-relaxed text-base">
                  Practical workshops for contract management and legal operations
                </p>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/contact"
              className="btn btn-primary-beige text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Contact us to learn more
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4">
              Pricing
            </h2>
            <div className="w-24 h-1 bg-brand-600 mx-auto mb-6"></div>
            <h3 className="text-2xl md:text-3xl font-semibold text-brand-700 mb-4">
              Transparent, Predictable Pricing
            </h3>
            <p className="text-lg md:text-xl text-brand-700 leading-relaxed max-w-4xl mx-auto mb-8">
              We offer service plans designed for clarity and scalability:
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card text-center"
            >
              <h4 className="text-lg font-bold text-brand-700 mb-2">NDA Reviews</h4>
              <p className="text-2xl font-bold text-brand-600 mb-4">NGN60,000</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card text-center border-2 border-brand-600"
            >
              <div className="badge badge-info mb-2 mx-auto w-fit">Popular</div>
              <h4 className="text-lg font-bold text-brand-700 mb-2">SLA and Service Agreement Reviews</h4>
              <p className="text-2xl font-bold text-brand-600 mb-4">NGN100,000</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="card text-center"
            >
              <h4 className="text-lg font-bold text-brand-700 mb-2">Tech MSAs and Order Forms</h4>
              <p className="text-2xl font-bold text-brand-600 mb-4">NGN150,000</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="card text-center"
            >
              <h4 className="text-lg font-bold text-brand-700 mb-2">Fractional GC</h4>
              <p className="text-2xl font-bold text-brand-600 mb-4">NGN18,000<span className="text-base">/hour</span></p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/pricing"
              className="btn btn-primary-beige text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              See Full Pricing & Plans
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white relative overflow-hidden">
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
              <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-6">
                Our Expert Professional Law Team is Always Ready to Serve You the Best Solution!
              </h2>
              <Link href="/signup" className="btn btn-primary-beige text-lg px-8 py-4 inline-block">
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
                <span className="text-2xl font-bold text-brand-700">LegalEase</span>
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
