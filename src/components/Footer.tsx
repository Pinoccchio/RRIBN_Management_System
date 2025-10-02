import React from 'react';
import Image from 'next/image';
import { Container } from './ui/Container';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="about" className="bg-navy-900 text-white pt-16 pb-8">
      <Container maxWidth="xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <Image
                src="/images/logo.jpg"
                alt="301st RRIBn Logo"
                width={50}
                height={50}
                className="rounded-full"
              />
              <div>
                <div className="text-yellow-500 font-bold text-sm">301st RRIBn</div>
                <div className="text-gray-400 text-xs">Infantry Battalion</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Centralized Personnel Management System for the 301st Ready Reserve Infantry
              Battalion (301st Community Defense Center) of the Philippine Army Reserve Command.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#home" className="text-gray-400 hover:text-yellow-500 transition-colors text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="#capabilities" className="text-gray-400 hover:text-yellow-500 transition-colors text-sm">
                  Capabilities
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-yellow-500 transition-colors text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#signin" className="text-gray-400 hover:text-yellow-500 transition-colors text-sm">
                  Sign In
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Contact Information</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-400 text-sm">
                  Camp Gen. Manuel Tinio<br />
                  Cabanatuan City, Nueva Ecija
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-400 text-sm">
                  arescom.rmis@gmail.com
                </span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-gray-400 text-sm">
                  3rd Regional Community Defense Group<br />
                  Philippine Army Reserve Command
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-navy-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} 301st Ready Reserve Infantry Battalion. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs text-center md:text-right">
              Developed by National University - CCIT Capstone Team
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
};
