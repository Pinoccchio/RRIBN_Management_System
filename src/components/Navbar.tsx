'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/Button';
import { Container } from './ui/Container';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'HOME', href: '#home' },
    { label: 'CAPABILITIES', href: '#capabilities' },
    { label: 'ABOUT', href: '#about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-navy-900/98 backdrop-blur-md z-50 border-b border-yellow-500/20 shadow-lg">
      <Container maxWidth="2xl">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <Image
              src="/images/logo.jpg"
              alt="301st Ready Reserve Infantry Battalion Logo"
              width={60}
              height={60}
              className="rounded-full"
            />
            <div className="hidden md:block">
              <div className="text-yellow-500 font-bold text-sm tracking-wider">
                301st READY RESERVE
              </div>
              <div className="text-white font-semibold text-xs">
                INFANTRY BATTALION
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white text-sm font-medium hover:text-yellow-500 transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm" href="/signin">
              SIGN IN
            </Button>
            <Button variant="primary" size="sm" href="/register">
              REGISTER
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-navy-800">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-white text-sm font-medium hover:text-yellow-500 transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" size="sm" href="/signin">
                  SIGN IN
                </Button>
                <Button variant="primary" size="sm" href="/register">
                  REGISTER
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </nav>
  );
};
