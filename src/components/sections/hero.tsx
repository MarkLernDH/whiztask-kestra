'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, Star, Users, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (category !== 'all') params.set('category', category);
    router.push(`/marketplace?${params.toString()}`);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-green-50 via-blue-50 to-purple-100 overflow-hidden">
      <motion.div 
        className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 mt-20"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex flex-col md:flex-row items-center justify-between space-x-0 md:space-x-12">
          {/* Left Column */}
          <motion.div 
            variants={itemVariants} 
            className="w-full md:w-[58.951%] space-y-8"
          >
            <div className="space-y-5">
              <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
                Automate Your Work,<br />Amplify Your Impact
              </h1>
              <p className="text-xl text-gray-600">
                Deploy battle-tested automations in minutes. Transform how you work with pre-built, plug-and-play solutions.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => router.push('/marketplace')}
                  className="px-6 py-3 text-white bg-black rounded-xl border-2 border-black hover:bg-gray-800 transition-colors"
                >
                  Browse Marketplace
                </button>
                <button 
                  onClick={() => router.push('/automations')}
                  className="px-6 py-3 text-black bg-white rounded-xl border-2 border-black hover:bg-gray-50 transition-colors"
                >
                  My Automations
                </button>
              </div>
            </div>

            <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 h-[4.5rem]">
              <div className="flex-1 flex items-center pl-4 md:pl-[30px]">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search automations..."
                  className="w-full py-4 outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex items-center border-l border-gray-200 px-4">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="text-sm text-gray-600 outline-none bg-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="social-media">Social Media</option>
                  <option value="customer-support">Customer Support</option>
                  <option value="sales">Sales</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
              <button 
                onClick={handleSearch}
                className="px-[1.9rem] text-sm text-white bg-black rounded-xl border-2 border-black hover:bg-gray-800 transition-colors h-[75%] mr-1 ml-1"
              >
                Search
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold tracking-tight text-gray-900">250+</div>
                <div className="text-sm text-gray-500 mt-1">Live Automations</div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight text-gray-900">25K+</div>
                <div className="text-sm text-gray-500 mt-1">Hours Saved</div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight text-gray-900">7.5K+</div>
                <div className="text-sm text-gray-500 mt-1">Automations Run</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Hidden on Mobile */}
          <motion.div 
            variants={itemVariants} 
            className="hidden md:block md:w-[40.944%] relative mr-[-30px]"
          >
            <Image
              src="/images/newHero.svg"
              alt="TaskWhiz Automation Professionals"
              width={613}
              height={610}
              className="mr-[-30px] max-w-none"
            />

            {/* Floating Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute top-6 right-6 bg-white px-5 py-3 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Star className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Proof of Quality</div>
                  <div className="text-xs text-gray-500">5/5 User Rating</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-16 left-1/4 bg-white px-5 py-3 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"
                    />
                  ))}
                </div>
                <div className="text-sm font-semibold">58M+ Professionals</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
