"use client";
import React, { useState } from 'react';
import { FiHelpCircle, FiMail, FiMessageCircle, FiBook, FiVideo, FiFileText, FiUsers, FiSend, FiCheckCircle, FiClock, FiHeadphones } from 'react-icons/fi';
import Link from 'next/link';

const HelpSupport = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const supportCategories = [
        { id: 'account', label: 'Account Issues', icon: <FiUsers className="w-5 h-5" /> },
        { id: 'technical', label: 'Technical Support', icon: <FiFileText className="w-5 h-5" /> },
        { id: 'billing', label: 'Billing & Subscription', icon: <FiFileText className="w-5 h-5" /> },
        { id: 'content', label: 'Content & Posts', icon: <FiFileText className="w-5 h-5" /> },
        { id: 'privacy', label: 'Privacy & Security', icon: <FiUsers className="w-5 h-5" /> },
        { id: 'other', label: 'Other', icon: <FiHelpCircle className="w-5 h-5" /> },
    ];

    const quickLinks = [
        {
            icon: <FiBook className="w-6 h-6" />,
            title: 'Help Center',
            description: 'Browse FAQs and guides',
            href: '/main/help',
            color: 'from-blue-500 to-cyan-600',
        },
        {
            icon: <FiMessageCircle className="w-6 h-6" />,
            title: 'Community Forum',
            description: 'Get help from other users',
            href: '/main/communities',
            color: 'from-green-500 to-emerald-600',
        },
        {
            icon: <FiVideo className="w-6 h-6" />,
            title: 'Video Tutorials',
            description: 'Watch step-by-step guides',
            href: '/main/help',
            color: 'from-purple-500 to-pink-600',
        },
        {
            icon: <FiFileText className="w-6 h-6" />,
            title: 'Documentation',
            description: 'Comprehensive documentation',
            href: '/main/help',
            color: 'from-orange-500 to-red-600',
        },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsSubmitting(false);
        setIsSubmitted(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({
                name: '',
                email: '',
                subject: '',
                category: '',
                message: '',
            });
        }, 3000);
    };

    return (
        <div className="max-w-[1220px] mx-auto px-4 py-8 text-white">
            <div className="bg-[#06133FBF] backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6 md:p-10">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FiHeadphones className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                            Help & Support
                        </h1>
                    </div>
                    <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        We're here to help! Get in touch with our support team or explore our resources to find answers to your questions.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-white">Quick Resources</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickLinks.map((link, index) => (
                            <Link
                                key={index}
                                href={link.href}
                                className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all cursor-pointer group"
                            >
                                <div className={`w-12 h-12 bg-gradient-to-br ${link.color} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
                                    {link.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{link.title}</h3>
                                <p className="text-white/60 text-sm">{link.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Support Form */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-white">Contact Support</h2>
                    <div className="bg-white/5 rounded-2xl border border-white/10 p-6 md:p-8">
                        {isSubmitted ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FiCheckCircle className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">Message Sent Successfully!</h3>
                                <p className="text-white/80 mb-6">
                                    Thank you for contacting us. Our support team will get back to you within 24 hours.
                                </p>
                                <div className="flex items-center justify-center gap-2 text-white/60">
                                    <FiClock className="w-5 h-5" />
                                    <span className="text-sm">Response time: Usually within 24 hours</span>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
                                            Your Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-white/40"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-white/40"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-white/90 mb-2">
                                            Category *
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-white"
                                        >
                                            <option value="" className="bg-[#06133F]">Select a category</option>
                                            {supportCategories.map((cat) => (
                                                <option key={cat.id} value={cat.id} className="bg-[#06133F]">
                                                    {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-white/90 mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-white/40"
                                            placeholder="Brief description of your issue"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-white/90 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-white/40 resize-none"
                                        placeholder="Please provide as much detail as possible about your issue or question..."
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <FiSend className="w-5 h-5" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Support Information */}
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl border border-blue-500/30 p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-white mb-6">Support Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <FiClock className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2">Response Time</h4>
                            <p className="text-white/80 text-sm">Usually within 24 hours</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <FiMail className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2">Email Support</h4>
                            <p className="text-white/80 text-sm">support@raddit.com</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <FiMessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-2">Live Chat</h4>
                            <p className="text-white/80 text-sm">Available 24/7</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;

