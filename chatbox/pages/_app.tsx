// pages/_app.tsx
import React from 'react';
import { AppProps } from 'next/app';
import { AuthProvider } from '../src/context/AuthContext';
import { SocketProvider } from '../src/context/SocketContext';
import Header from '../src/components/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css'; // Ensure Tailwind CSS is imported

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Header />
        <Component {...pageProps} />
        <ToastContainer position="top-right" autoClose={3000} />
      </SocketProvider>
    </AuthProvider>
  );
};

export default MyApp;
