import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Hero from '../components/Hero';
import { FaCar, FaChargingStation, FaMapMarkedAlt, FaLeaf, FaShieldAlt, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const HomeScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const features = [
    {
      icon: <FaCar />,
      title: 'Premium Vehicles',
      description: 'Choose from a wide range of premium electric vehicles for your journey'
    },
    {
      icon: <FaChargingStation />,
      title: 'Smart Charging',
      description: 'Advanced charging stations with real-time monitoring and analytics'
    },
    {
      icon: <FaMapMarkedAlt />,
      title: 'Route Planning',
      description: 'Intelligent route planning that considers charging points and traffic'
    },
    {
      icon: <FaLeaf />,
      title: 'Eco-Friendly',
      description: 'Reduce your carbon footprint with zero emission transportation'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Secure Rentals',
      description: 'Aadhar verification ensures safety and prevents fraudulent activities'
    },
    {
      icon: <FaClock />,
      title: 'Flexible Timing',
      description: 'Rent by the hour, day, or week with easy booking extensions'
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardHover = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.03,
      boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <>
      <Hero />

      {/* Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-dark-950 dark:to-dark-900"
      >
        <div className="container mx-auto px-4">
          <motion.div 
            variants={fadeInUp}
            className="max-w-3xl mx-auto text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900 dark:text-gray-100">
              Why Choose Our EV Rental Service?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Experience the future of transportation with our premium EV rental platform
              that combines technology, convenience, and sustainability.
            </p>
          </motion.div>

          <motion.div 
            variants={container}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover="hover"
                initial="rest"
                className="relative"
              >
                <motion.div 
                  variants={cardHover}
                  className="card h-full p-6 flex flex-col items-center text-center bg-white dark:bg-dark-900"
                >
                  <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-2xl mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 flex-grow">{feature.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-20 bg-gray-50 dark:bg-dark-900"
      >
        <div className="container mx-auto px-4">
          <motion.div 
            variants={fadeInUp}
            className="max-w-3xl mx-auto text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900 dark:text-gray-100">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Renting an EV has never been easier with our streamlined process
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-1/4 left-0 right-0 h-1 bg-primary-200 dark:bg-primary-900/50 z-0" style={{ top: '45%' }}></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { number: 1, title: 'Find a Station', description: 'Locate the nearest EV station through our interactive map' },
                  { number: 2, title: 'Book a Vehicle', description: 'Choose your preferred EV model and booking duration' },
                  { number: 3, title: 'Ride & Return', description: 'Enjoy your ride and return the vehicle to any of our stations' }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="relative z-10 flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary-600 dark:bg-primary-800 text-white flex items-center justify-center text-3xl font-bold mb-4 border-4 border-white dark:border-dark-900 shadow-lg">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <motion.div 
            variants={fadeInUp}
            className="text-center mt-12"
          >
            {!userInfo ? (
              <Link to="/register" className="btn-primary">
                Get Started Today
              </Link>
            ) : userInfo.role === 'customer' ? (
              <Link to="/stations" className="btn-primary">
                Find Available Stations
              </Link>
            ) : (
              <Link to={userInfo.role === 'admin' ? '/admin' : '/station-master'} className="btn-primary">
                Go to Dashboard
              </Link>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-20 bg-white dark:bg-dark-950"
      >
        <div className="container mx-auto px-4">
          <motion.div 
            variants={fadeInUp}
            className="max-w-3xl mx-auto text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display text-gray-900 dark:text-gray-100">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </motion.div>

          <motion.div 
            variants={container}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {[
              { name: 'Aditya Sharma', role: 'Business Traveler', quote: 'The real-time tracking feature gives me peace of mind during my business trips. Highly recommended!' },
              { name: 'Priya Patel', role: 'Eco Enthusiast', quote: 'I love contributing to a greener planet while enjoying premium electric vehicles. The interface is intuitive and booking is a breeze.' },
              { name: 'Rahul Mehra', role: 'City Explorer', quote: 'Perfect for weekend getaways! The battery never let me down and the support team was extremely helpful.' }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="card p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="text-primary-500 dark:text-primary-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xl">★</span>
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic mb-6">"{testimonial.quote}"</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">{testimonial.name}</h4>
                  <p className="text-primary-600 dark:text-primary-400 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="py-16 bg-primary-600 dark:bg-primary-900"
      >
        <div className="container mx-auto px-4">
          <motion.div 
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white font-display">
              Ready to Experience the Future of Mobility?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of satisfied users who have made the switch to electric vehicles.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              {!userInfo ? (
                <>
                  <Link to="/register" className="btn-primary bg-white text-primary-700 hover:bg-primary-50">
                    Create Account
                  </Link>
                  <Link to="/login" className="btn-outline border-white text-white hover:bg-primary-700/50 dark:hover:bg-primary-800/50">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link 
                  to={userInfo.role === 'customer' ? '/stations' : (userInfo.role === 'admin' ? '/admin' : '/station-master')} 
                  className="btn-primary bg-white text-primary-700 hover:bg-primary-50"
                >
                  {userInfo.role === 'customer' ? 'Browse Available EVs' : 'Go to Dashboard'}
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </motion.section>
    </>
  );
};

export default HomeScreen;
