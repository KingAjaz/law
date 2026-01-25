'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { HeroBanner } from '@/components/HeroBanner'
import { CONTACT_INFO } from '@/lib/constants'
import { StructuredData, getOrganizationStructuredData, getWebsiteStructuredData, getServiceStructuredData } from '@/components/StructuredData'
import {
  Users, CheckCircle, ArrowRight, Briefcase,
  Building2, Car, Coffee, Shield, Users2, Phone, Mail,
  Gavel, MessageSquare, Rocket, Building, Zap, Upload, FileText, Lightbulb
} from 'lucide-react'

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])
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
    <>
      <StructuredData data={getOrganizationStructuredData()} />
      <StructuredData data={getWebsiteStructuredData()} />
      <StructuredData data={getServiceStructuredData()} />
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />

        {/* Hero Banner with Dynamic Images */}
        <HeroBanner />

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl"
              >
                <Image
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&auto=format&fit=crop"
                  alt="Modern law firm office building"
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-6">
                  Legal Support That Works the Way You Do
                </h2>
                <div className="w-24 h-1 bg-brand-600 mb-6"></div>
                <p className="text-lg md:text-xl text-brand-800 mb-8 leading-relaxed font-medium">
                  Legalease provides on-demand contract review and fractional GC services tailored for the
                  fintech, finance, and technology sectors. We help you manage legal workloads with specialists
                  who understand your industry, so your team can focus on strategy, growth, and execution.
                </p>
              </motion.div>
            </div>

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

        <section className="py-20 bg-brand-50">
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
              <div className="w-24 h-1 bg-brand-600 mx-auto mb-8"></div>
              <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl max-w-4xl mx-auto">
                <Image
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop"
                  alt="Business district with modern office buildings"
                  fill
                  className="object-cover"
                />
              </div>
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


        <section className="py-20 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl order-2 lg:order-1"
              >
                <Image
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&auto=format&fit=crop"
                  alt="Professional corporate building"
                  fill
                  className="object-cover"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4">
                  Industry Experience You Can Trust
                </h2>
                <div className="w-24 h-1 bg-brand-600 mb-6"></div>
                <p className="text-lg md:text-xl text-brand-700 leading-relaxed">
                  Our team has decades of combined legal experience with leading fintech unicorns, international
                  law firms, and investment companies — locally and cross-border. We've supported C-suite
                  executives, in-house legal teams, and fast-scaling tech businesses with real legal work.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-brand-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4">
                  About Us
                </h2>
                <div className="w-24 h-1 bg-brand-600 mb-6"></div>
                <h3 className="text-2xl md:text-3xl font-semibold text-brand-700 mb-6">
                  Built for Tech, Fintech & Modern Legal Teams
                </h3>
                <div className="space-y-6">
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
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
              >
                <Image
                  src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80&auto=format&fit=crop"
                  alt="Modern tech office building"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>

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
                Our Services
              </h2>
              <div className="w-24 h-1 bg-brand-600 mx-auto mb-8"></div>
              <div className="relative h-[350px] md:h-[450px] rounded-2xl overflow-hidden shadow-xl max-w-5xl mx-auto mb-12">
                <Image
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop"
                  alt="Professional business services"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-end">
                  <div className="p-8 w-full bg-white/90 backdrop-blur-sm">
                    <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-brand-700">
                      Legal Process Outsourcing
                    </h3>
                    <p className="text-xl md:text-2xl font-medium text-brand-700">
                      Precise Contract Reviews — Fast Turnaround
                    </p>
                  </div>
                </div>
              </div>
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
                on schedule.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Link
                href={isAuthenticated ? "/dashboard" : "/signup"}
                className="btn btn-primary-beige text-lg px-8 py-4 inline-flex items-center gap-2"
              >
                Request Contract Review
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-brand-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative h-[450px] rounded-2xl overflow-hidden shadow-2xl order-2 lg:order-1"
              >
                <Image
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&auto=format&fit=crop"
                  alt="Executive business building"
                  fill
                  className="object-cover"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4">
                  Fractional General Counsel
                </h2>
                <div className="w-24 h-1 bg-brand-600 mb-6"></div>
                <h3 className="text-2xl md:text-3xl font-semibold text-brand-700 mb-4">
                  Strategic Counsel — Fractional & Scalable
                </h3>
                <p className="text-lg md:text-xl text-brand-700 leading-relaxed mb-8">
                  Not ready for a full-time GC? We provide flexible counsel for:
                </p>
              </motion.div>
            </div>

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
                href={isAuthenticated ? "/contact" : "/signup"}
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
              <div className="w-24 h-1 bg-brand-600 mx-auto mb-8"></div>
              <div className="relative h-[350px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl max-w-4xl mx-auto mb-12">
                <Image
                  src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80&auto=format&fit=crop"
                  alt="Professional training and development building"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-end">
                  <div className="p-8 w-full bg-white/90 backdrop-blur-sm">
                    <h3 className="text-2xl md:text-3xl font-semibold text-brand-700">
                      Grow Your Legal Team — With Support
                    </h3>
                  </div>
                </div>
              </div>
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

        <section className="py-20 bg-brand-50">
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
              <div className="w-24 h-1 bg-brand-600 mx-auto mb-8"></div>
              <div className="relative h-[300px] md:h-[350px] rounded-2xl overflow-hidden shadow-xl max-w-5xl mx-auto mb-12">
                <Image
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop"
                  alt="Corporate headquarters building"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-lg">
                    <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-brand-700">
                      Transparent, Predictable Pricing
                    </h3>
                    <p className="text-lg md:text-xl text-brand-700">
                      Service plans designed for clarity and scalability
                    </p>
                  </div>
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
                href="/pricing"
                className="btn btn-primary-beige text-lg px-8 py-4 inline-flex items-center gap-2"
              >
                See Full Pricing & Plans
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </section>


        <Footer />
      </div>
    </>
  )
}
