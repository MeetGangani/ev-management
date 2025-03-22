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
                  Home
                </Link>
              </li>
              <li>
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
                </Link>
              </li>
            </ul>
          </div>

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
              </li>
            </ul>
          </div>
        </div>

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
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 