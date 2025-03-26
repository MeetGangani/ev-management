import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const ScrollReveal = ({ 
  children, 
  threshold = 0.1,
  triggerOnce = true,
  animation = 'fade-up',
  delay = 0,
  duration = 0.5,
  className = '',
  rootMargin = '0px',
  distance = '50px'
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Define animation variants
  const getVariants = () => {
    const baseVariants = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { 
          duration: duration,
          delay: delay,
          ease: 'easeOut'
        }
      }
    };

    switch (animation) {
      case 'fade':
        return baseVariants;
      
      case 'fade-up':
        return {
          hidden: { ...baseVariants.hidden, y: distance },
          visible: { ...baseVariants.visible, y: 0 }
        };
      
      case 'fade-down':
        return {
          hidden: { ...baseVariants.hidden, y: `-${distance}` },
          visible: { ...baseVariants.visible, y: 0 }
        };
      
      case 'fade-left':
        return {
          hidden: { ...baseVariants.hidden, x: `-${distance}` },
          visible: { ...baseVariants.visible, x: 0 }
        };
      
      case 'fade-right':
        return {
          hidden: { ...baseVariants.hidden, x: distance },
          visible: { ...baseVariants.visible, x: 0 }
        };
      
      case 'zoom-in':
        return {
          hidden: { ...baseVariants.hidden, scale: 0.8 },
          visible: { ...baseVariants.visible, scale: 1 }
        };
      
      case 'zoom-out':
        return {
          hidden: { ...baseVariants.hidden, scale: 1.2 },
          visible: { ...baseVariants.visible, scale: 1 }
        };
        
      default:
        return baseVariants;
    }
  };

  const variants = getVariants();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(ref.current);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );

    const currentRef = ref.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, triggerOnce, rootMargin]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

ScrollReveal.propTypes = {
  children: PropTypes.node.isRequired,
  threshold: PropTypes.number,
  triggerOnce: PropTypes.bool,
  animation: PropTypes.oneOf([
    'fade', 'fade-up', 'fade-down', 'fade-left', 'fade-right', 
    'zoom-in', 'zoom-out'
  ]),
  delay: PropTypes.number,
  duration: PropTypes.number,
  className: PropTypes.string,
  rootMargin: PropTypes.string,
  distance: PropTypes.string
};

export default ScrollReveal; 