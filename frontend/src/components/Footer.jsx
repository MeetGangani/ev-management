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
                  Home
                </Link>
              </li>
              <li>
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
                </Link>
              </li>
            </ul>
          </div>
          
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
              </li>
            </ul>
          </div>
        </div>
        
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
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;