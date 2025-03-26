import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
  return (
    <Container className="py-5 my-5">
      <Helmet>
        <title>Page Not Found | EV Rental</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
      </Helmet>
      
      <Row className="justify-content-center text-center">
        <Col md={8} lg={6}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FaExclamationTriangle className="text-warning mb-4" size={80} />
            
            <h1 className="display-1 fw-bold">404</h1>
            <h2 className="mb-4">Page Not Found</h2>
            
            <p className="lead mb-5">
              Oops! The page you are looking for might have been removed, 
              had its name changed, or is temporarily unavailable.
            </p>
            
            <Button 
              as={Link} 
              to="/" 
              variant="primary" 
              size="lg" 
              className="d-inline-flex align-items-center gap-2"
            >
              <FaArrowLeft /> Go Back Home
            </Button>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound; 