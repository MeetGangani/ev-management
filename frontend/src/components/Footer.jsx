<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBolt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-b from-primary-900 to-primary-950 text-white relative z-10">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent-teal/5 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 right-1/4 w-52 h-52 bg-accent-purple/5 rounded-full blur-3xl opacity-50"></div>
      
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-primary-700/30">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-5">
              <FaBolt className="text-accent-teal text-2xl mr-2" />
              <h3 className="text-xl font-bold tracking-tight gradient-text">Volt Ride</h3>
            </div>
            <p className="text-white/70 mb-4 leading-relaxed">
              Revolutionizing electric mobility with cutting-edge EV rental solutions, making sustainable transportation accessible to everyone.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-3 mt-6">
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-800/70 hover:bg-primary-700/70 border border-primary-700/30 hover:border-primary-600/50 transition-colors duration-300">
                <FaTwitter className="text-accent-teal" />
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-800/70 hover:bg-primary-700/70 border border-primary-700/30 hover:border-primary-600/50 transition-colors duration-300">
                <FaFacebook className="text-accent-teal" />
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-800/70 hover:bg-primary-700/70 border border-primary-700/30 hover:border-primary-600/50 transition-colors duration-300">
                <FaInstagram className="text-accent-teal" />
              </a>
              <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-800/70 hover:bg-primary-700/70 border border-primary-700/30 hover:border-primary-600/50 transition-colors duration-300">
                <FaLinkedin className="text-accent-teal" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="w-1.5 h-1.5 bg-accent-teal rounded-full mr-2"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-white/70 hover:text-accent-teal transition-colors duration-300 inline-flex items-center">
                  <span className="w-1 h-1 bg-accent-teal/70 rounded-full mr-2"></span>
=======
import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaGithub, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`mt-24 border-t ${isDark ? 'border-primary-900' : 'border-primary-100'}`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-primary-400 drop-shadow-[0_0_6px_rgba(72,255,128,0.5)]' : 'text-primary-700'}`}>
              EV Charging Platform
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your one-stop solution for electric vehicle charging needs. Find, book, and manage your charging experience effortlessly.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className={`text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>
              <a 
                href="#" 
                className={`text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                aria-label="Facebook"
              >
                <FaFacebook />
              </a>
              <a 
                href="#" 
                className={`text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
              <a 
                href="#" 
                className={`text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                aria-label="LinkedIn"
              >
                <FaLinkedin />
              </a>
              <a 
                href="#" 
                className={`text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                aria-label="GitHub"
              >
                <FaGithub />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-primary-400' : 'text-primary-700'}`}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className={`text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                >
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                  Home
                </Link>
              </li>
              <li>
<<<<<<< HEAD
                <Link to="/about" className="text-white/70 hover:text-accent-teal transition-colors duration-300 inline-flex items-center">
                  <span className="w-1 h-1 bg-accent-teal/70 rounded-full mr-2"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-white/70 hover:text-accent-teal transition-colors duration-300 inline-flex items-center">
                  <span className="w-1 h-1 bg-accent-teal/70 rounded-full mr-2"></span>
                  Services
                </Link>
              </li>
              <li>
                <Link to="/stations" className="text-white/70 hover:text-accent-teal transition-colors duration-300 inline-flex items-center">
                  <span className="w-1 h-1 bg-accent-teal/70 rounded-full mr-2"></span>
                  EV Stations
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-white/70 hover:text-accent-teal transition-colors duration-300 inline-flex items-center">
                  <span className="w-1 h-1 bg-accent-teal/70 rounded-full mr-2"></span>
                  Login
=======
                <Link 
                  to="/stations" 
                  className={`text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                >
                  Find Stations
                </Link>
              </li>
              <li>
                <Link 
                  to="/my-bookings" 
                  className={`text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                >
                  My Bookings
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  className={`text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                >
                  Profile
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                </Link>
              </li>
            </ul>
          </div>
<<<<<<< HEAD
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="w-1.5 h-1.5 bg-accent-purple rounded-full mr-2"></span>
              Our Services
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/ev-rental" className="text-white/70 hover:text-accent-purple transition-colors duration-300 inline-flex items-center">
                  <span className="w-1 h-1 bg-accent-purple/70 rounded-full mr-2"></span>
                  EV Rental
                </Link>
              </li>
              <li>
                <Link to="/charging" className="text-white/70 hover:text-accent-purple transition-colors duration-300 inline-flex items-center">
                  <span className="w-1 h-1 bg-accent-purple/70 rounded-full mr-2"></span>
                  Charging Solutions
                </Link>
              </li>
              <li>
                <Link to="/tracking" className="text-white/70 hover:text-accent-purple transition-colors duration-300 inline-flex items-center">
                  <span className="w-1 h-1 bg-accent-purple/70 rounded-full mr-2"></span>
                  Real-time Tracking
                </Link>
              </li>
              <li>
                <Link to="/maintenance" className="text-white/70 hover:text-accent-purple transition-colors duration-300 inline-flex items-center">
                  <span className="w-1 h-1 bg-accent-purple/70 rounded-full mr-2"></span>
                  Maintenance
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-white/70 hover:text-accent-purple transition-colors duration-300 inline-flex items-center">
                  <span className="w-1 h-1 bg-accent-purple/70 rounded-full mr-2"></span>
                  Customer Support
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="w-1.5 h-1.5 bg-accent-teal rounded-full mr-2"></span>
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-accent-teal mt-1 mr-3 flex-shrink-0" />
                <p className="text-white/70">
                  123 EV Drive, Electric City,<br />
                  Mobility State, 10001
                </p>
              </li>
              <li className="flex items-center">
                <FaPhone className="text-accent-teal mr-3 flex-shrink-0" />
                <p className="text-white/70">+1 (555) 123-4567</p>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-accent-teal mr-3 flex-shrink-0" />
                <p className="text-white/70">info@voltride.com</p>
=======

          {/* Services */}
          <div>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-secondary-400' : 'text-primary-700'}`}>
              Services
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/stations" 
                  className={`text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-secondary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(255,230,0,0.6)]' : ''}`}
                >
                  Station Booking
                </Link>
              </li>
              <li>
                <Link 
                  to="/payment" 
                  className={`text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-secondary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(255,230,0,0.6)]' : ''}`}
                >
                  Payment Management
                </Link>
              </li>
              <li>
                <Link 
                  to="/notifications" 
                  className={`text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-secondary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(255,230,0,0.6)]' : ''}`}
                >
                  Notifications
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className={`text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-secondary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(255,230,0,0.6)]' : ''}`}
                >
                  EV Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-secondary-400' : 'text-primary-700'}`}>
              Contact Us
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600 dark:text-gray-400">
                <FaMapMarkerAlt className={`mr-2 ${isDark ? 'text-secondary-500' : 'text-primary-600'}`} />
                123 EV Street, Electric City, EC 12345
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-400">
                <FaPhone className={`mr-2 ${isDark ? 'text-secondary-500' : 'text-primary-600'}`} />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-400">
                <FaEnvelope className={`mr-2 ${isDark ? 'text-secondary-500' : 'text-primary-600'}`} />
                info@evcharging.com
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
              </li>
            </ul>
          </div>
        </div>
<<<<<<< HEAD
        
        {/* Copyright & Legal */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm mb-4 md:mb-0">
            &copy; {currentYear} Volt Ride. All rights reserved.
          </p>
          
          <div className="flex space-x-4">
            <Link to="/privacy" className="text-white/60 hover:text-white text-sm transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white/60 hover:text-white text-sm transition-colors duration-300">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-white/60 hover:text-white text-sm transition-colors duration-300">
              Cookie Policy
=======

        {/* Footer Bottom */}
        <div className={`mt-12 pt-6 border-t ${isDark ? 'border-primary-900' : 'border-primary-100'} flex flex-col md:flex-row justify-between items-center`}>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} EV Charging Platform. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link 
              to="/privacy" 
              className={`text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className={`text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
            >
              Terms of Service
            </Link>
            <Link 
              to="/faq" 
              className={`text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
            >
              FAQ
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

<<<<<<< HEAD
export default Footer;
=======
export default Footer; 
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
