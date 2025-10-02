import React from 'react';
import { Container } from './ui/Container';

export const Hero: React.FC = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/hero-bg.jpg)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 via-navy-900/85 to-navy-900/90"></div>
      </div>

      {/* Content */}
      <Container maxWidth="xl" className="relative z-10">
        <div className="text-center space-y-8 py-20">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            301st READY<br />
            RESERVE INFANTRY<br />
            BATTALION
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Personnel Management System for Administrators and staff personnel of the 301st
            Ready Reserve Infantry Battalion.
          </p>

          {/* Scroll Indicator */}
          <div className="pt-12">
            <div className="inline-flex flex-col items-center space-y-2 animate-bounce">
              <div className="w-6 h-10 border-2 border-yellow-500 rounded-full flex items-start justify-center p-2">
                <div className="w-1 h-3 bg-yellow-500 rounded-full"></div>
              </div>
              <svg
                className="w-6 h-6 text-yellow-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
