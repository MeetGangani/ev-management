import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { NotificationProvider } from './components/NotificationSystem';
import ThemeSwitcher from './components/ThemeSwitcher';
import PageTransition from './components/PageTransition';

const App = () => {
  return (
    <NotificationProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 to-primary-950">
        <Header />
        <main className="flex-grow">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <div className="fixed bottom-6 right-6 z-50">
          <ThemeSwitcher />
        </div>
        <Footer />
        <ToastContainer />
      </div>
    </NotificationProvider>
  );
};

export default App;
