import React from 'react';
import '../styles/globals.css';
import { AppProps } from 'next/app';
import { AuthProvider } from '../src/context/AuthContext';
import { SocketProvider } from '../src/context/SocketContext';
import Header from '../src/components/Header';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <SocketProvider>
                <div className="flex flex-col min-h-screen bg-gray-100">
                    <Header />
                    <main className="flex-1 pt-16 px-4 sm:px-6 lg:px-8">
                        <Component {...pageProps} />
                    </main>
                </div>
            </SocketProvider>
        </AuthProvider>

    );
}

export default MyApp;
