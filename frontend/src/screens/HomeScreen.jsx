import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaBolt, FaChargingStation, FaMapMarkedAlt, FaUserClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNotification } from '../components/NotificationSystem';
import ScrollReveal from '../components/ScrollReveal';
import { useEffect } from 'react';

const HomeScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { addNotification } = useNotification();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const showWelcomeNotification = () => {
    addNotification({
      title: 'Welcome to EV Management',
      message: 'Explore our modern UI with stunning animations and visualizations.',
      type: 'info',
      duration: 5000
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      showWelcomeNotification();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-800 text-white">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Hero Section */}
        <ScrollReveal animation="fade-up">
          <section className="relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-20 right-20 w-96 h-96 bg-accent-teal/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl"></div>
            
            <div className="container mx-auto px-4 py-20 relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-center max-w-3xl mx-auto"
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                  <span className="gradient-text">Electrify Your Journey</span>
                </h1>
                
                <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed">
                  Experience hassle-free electric vehicle rentals with real-time tracking and seamless booking.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {userInfo ? (
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-accent-teal to-accent-teal/80 text-white rounded-xl font-medium shadow-glow-teal hover:shadow-glow-teal-lg transition-all duration-300 transform hover:scale-105"
                    >
                      <FaBolt className="mr-2" />
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-accent-teal to-accent-teal/80 text-white rounded-xl font-medium shadow-glow-teal hover:shadow-glow-teal-lg transition-all duration-300 transform hover:scale-105"
                      >
                        Get Started
                      </Link>
                      <Link
                        to="/register"
                        className="inline-flex items-center justify-center px-6 py-3 bg-transparent border border-primary-500/50 hover:border-primary-400 text-white rounded-xl font-medium hover:bg-primary-800/50 transition-all duration-300"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </section>
        </ScrollReveal>

        {/* Features Section */}
        <ScrollReveal animation="fade-up" delay={0.2}>
          <section className="py-20 relative">
            <div className="container mx-auto px-4">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold text-center mb-14 gradient-text-subtle"
              >
                Explore Our Features
              </motion.h2>
              
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {/* Feature 1 */}
                <motion.div 
                  variants={item}
                  className="group relative bg-gradient-to-br from-primary-800/90 to-primary-700/90 rounded-xl p-6 shadow-glass-sm backdrop-blur-sm border border-primary-600/20 hover:shadow-glass-md transition-all duration-300"
                >
                  <div className="absolute right-0 top-0 rounded-full w-32 h-32 bg-accent-teal/5 blur-xl transform group-hover:scale-110 transition-transform duration-500 -mr-10 -mt-10"></div>
                  
                  <div className="p-3 bg-gradient-to-br from-primary-700/70 to-primary-800/70 rounded-lg w-14 h-14 flex items-center justify-center mb-5 shadow-glass-sm border border-primary-600/10">
                    <FaChargingStation className="text-accent-teal text-2xl" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">Smart EV Charging</h3>
                  <p className="text-white/70 leading-relaxed">Find the nearest charging stations and book your spot in advance, ensuring your vehicle is always ready to go.</p>
                </motion.div>
                
                {/* Feature 2 */}
                <motion.div 
                  variants={item}
                  className="group relative bg-gradient-to-br from-primary-800/90 to-primary-700/90 rounded-xl p-6 shadow-glass-sm backdrop-blur-sm border border-primary-600/20 hover:shadow-glass-md transition-all duration-300"
                >
                  <div className="absolute right-0 top-0 rounded-full w-32 h-32 bg-accent-purple/5 blur-xl transform group-hover:scale-110 transition-transform duration-500 -mr-10 -mt-10"></div>
                  
                  <div className="p-3 bg-gradient-to-br from-primary-700/70 to-primary-800/70 rounded-lg w-14 h-14 flex items-center justify-center mb-5 shadow-glass-sm border border-primary-600/10">
                    <FaMapMarkedAlt className="text-accent-purple text-2xl" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">Real-time Tracking</h3>
                  <p className="text-white/70 leading-relaxed">Track your vehicle's location, battery status, and usage in real-time through our intuitive dashboard.</p>
                </motion.div>
                
                {/* Feature 3 */}
                <motion.div 
                  variants={item}
                  className="group relative bg-gradient-to-br from-primary-800/90 to-primary-700/90 rounded-xl p-6 shadow-glass-sm backdrop-blur-sm border border-primary-600/20 hover:shadow-glass-md transition-all duration-300"
                >
                  <div className="absolute right-0 top-0 rounded-full w-32 h-32 bg-accent-teal/5 blur-xl transform group-hover:scale-110 transition-transform duration-500 -mr-10 -mt-10"></div>
                  
                  <div className="p-3 bg-gradient-to-br from-primary-700/70 to-primary-800/70 rounded-lg w-14 h-14 flex items-center justify-center mb-5 shadow-glass-sm border border-primary-600/10">
                    <FaUserClock className="text-accent-teal text-2xl" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">Flexible Booking</h3>
                  <p className="text-white/70 leading-relaxed">Book EVs for the duration you need, modify or cancel bookings easily, and extend your rental with just a few clicks.</p>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </ScrollReveal>

        {/* CTA Section */}
        <ScrollReveal animation="fade-up" delay={0.5}>
          <section className="py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-800 opacity-80"></div>
            <div className="absolute inset-0 backdrop-blur-sm"></div>
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary-800/70 to-primary-700/70 rounded-2xl p-10 shadow-glass-lg backdrop-blur-md border border-primary-600/30">
                <div className="text-center">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-3xl md:text-4xl font-bold mb-6 gradient-text"
                  >
                    Ready to Get Started?
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-lg text-white/80 mb-8 max-w-2xl mx-auto"
                  >
                    Join thousands of satisfied customers who have made the switch to electric mobility. Experience the future of transportation today.
                  </motion.p>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                    {userInfo ? (
                      <Link
                        to="/stations"
                        className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-accent-teal to-accent-teal/80 text-white rounded-xl font-medium shadow-glow-teal hover:shadow-glow-teal-lg transition-all duration-300 transform hover:scale-105"
                      >
                        Browse Stations
                      </Link>
                    ) : (
                      <Link
                        to="/register"
                        className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-accent-teal to-accent-teal/80 text-white rounded-xl font-medium shadow-glow-teal hover:shadow-glow-teal-lg transition-all duration-300 transform hover:scale-105"
                      >
                        Sign Up Now
                      </Link>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </motion.div>
    </div>
  );
};

export default HomeScreen;
