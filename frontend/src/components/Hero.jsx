import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaCar, FaMapMarkerAlt, FaUserCheck, FaBolt, FaLeaf } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create particles
    const particleCount = 30;
    particlesRef.current = Array(particleCount).fill().map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: Math.random() * 1 - 0.5,
      speedY: Math.random() * 1 - 0.5,
      opacity: Math.random() * 0.5 + 0.3
    }));
    
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Calculate distance to mouse
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;
        
        if (distance < maxDistance) {
          const force = (1 - distance / maxDistance) * 0.2;
          particle.speedX -= dx * force / 100;
          particle.speedY -= dy * force / 100;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120, 200, 255, ${particle.opacity})`;
        ctx.fill();
        
        // Draw connections
        particlesRef.current.forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(120, 200, 255, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
};

const Hero = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const featureVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 100 
      }
    },
    hover: { 
      scale: 1.05, 
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen flex items-center">
      <ParticleBackground />
      
      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 font-display bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-400 dark:to-secondary-300"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 100,
                delay: 0.1 
              }}
            >
              Future of EV Rentals
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Experience seamless electric vehicle rentals with real-time tracking, 
              smart navigation, and automated payment systems.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-6 mb-12"
            variants={containerVariants}
          >
            <motion.div 
              className="card-glass p-6 dark:border-dark-800 backdrop-blur-sm"
              variants={featureVariants}
              whileHover="hover"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <FaCar className="text-2xl" />
                </div>
              </div>
              <h3 className="font-bold text-lg text-center mb-2 text-gray-900 dark:text-gray-100">Quick Bookings</h3>
              <p className="text-center text-gray-600 dark:text-gray-300">Choose from available EVs and book in seconds with just a few taps</p>
            </motion.div>
            
            <motion.div 
              className="card-glass p-6 dark:border-dark-800 backdrop-blur-sm"
              variants={featureVariants}
              whileHover="hover"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center text-secondary-600 dark:text-secondary-400">
                  <FaMapMarkerAlt className="text-2xl" />
                </div>
              </div>
              <h3 className="font-bold text-lg text-center mb-2 text-gray-900 dark:text-gray-100">Real-time Tracking</h3>
              <p className="text-center text-gray-600 dark:text-gray-300">Live location updates and navigation for your entire journey</p>
            </motion.div>
            
            <motion.div 
              className="card-glass p-6 dark:border-dark-800 backdrop-blur-sm"
              variants={featureVariants}
              whileHover="hover"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-accent-600 dark:text-accent-400">
                  <FaBolt className="text-2xl" />
                </div>
              </div>
              <h3 className="font-bold text-lg text-center mb-2 text-gray-900 dark:text-gray-100">Smart Charging</h3>
              <p className="text-center text-gray-600 dark:text-gray-300">Find charging stations and monitor battery levels in real-time</p>
            </motion.div>
          </motion.div>

          <motion.div 
            className="text-center mt-6"
            variants={itemVariants}
          >
            {!userInfo ? (
              <div className="space-x-4">
                <motion.div 
                  className="inline-block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/login" 
                    className="btn-primary"
                  >
                    Get Started
                  </Link>
                </motion.div>
                <motion.div 
                  className="inline-block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/register" 
                    className="btn-outline"
                  >
                    Create Account
                  </Link>
                </motion.div>
              </div>
            ) : (
              <div>
                {userInfo.role === 'customer' && userInfo.aadharVerified === false ? (
                  <motion.div 
                    className="p-4 card-glass bg-yellow-50/90 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 mb-4 max-w-md mx-auto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-yellow-800 dark:text-yellow-200 mb-2">
                      Please verify your Aadhar to start booking EVs
                    </p>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link 
                        to="/profile" 
                        className="btn-primary bg-yellow-600 hover:bg-yellow-700"
                      >
                        Verify Now
                      </Link>
                    </motion.div>
                  </motion.div>
                ) : userInfo.role === 'customer' && userInfo.aadharVerified === true ? (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to="/stations" 
                      className="btn-primary bg-green-600 hover:bg-green-700"
                    >
                      Find Stations & Book Now
                    </Link>
                  </motion.div>
                ) : userInfo.role === 'stationMaster' ? (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to="/station-master" 
                      className="btn-primary"
                    >
                      Manage Your Station
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to="/admin" 
                      className="btn-primary bg-purple-600 hover:bg-purple-700"
                    >
                      Admin Dashboard
                    </Link>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
          
          <motion.div 
            className="mt-12 md:mt-16 text-center text-gray-500 dark:text-gray-400 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <FaLeaf className="text-green-500 mr-2" />
            <span>Helping reduce carbon emissions one ride at a time</span>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="hidden md:block absolute -bottom-16 -left-16 w-64 h-64 bg-primary-400/10 dark:bg-primary-900/20 rounded-full filter blur-3xl"></div>
      <div className="hidden md:block absolute top-32 -right-16 w-72 h-72 bg-secondary-400/10 dark:bg-secondary-900/20 rounded-full filter blur-3xl"></div>
    </div>
  );
};

export default Hero;
