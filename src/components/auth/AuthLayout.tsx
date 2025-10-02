'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const authImages = [
  '/images/hero/53bb92d2-ca6d-4179-bff5-250142b5f437.jpg',
  '/images/hero/bece77fb-df31-443c-93a4-8010c14d4f73.jpg',
  '/images/hero/d308b8c7-3069-45ee-a7f9-bdd2cf5dd0f2.jpg',
  '/images/hero/daf3f2cd-e46a-4a22-b6d0-b952bc856e5f.jpg',
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % authImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Image Carousel */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          {authImages.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${image})`,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-navy-900/90 via-navy-900/80 to-navy-900/70"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <Image
              src="/images/logo.jpg"
              alt="301st RRIBn Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
            <div>
              <div className="text-yellow-500 font-bold text-lg tracking-wider">
                301st READY RESERVE
              </div>
              <div className="text-white font-semibold text-sm">
                INFANTRY BATTALION
              </div>
            </div>
          </Link>

          {/* Center Content */}
          <div className="space-y-6">
            <div className="w-16 h-1 bg-yellow-500"></div>
            <h2 className="text-4xl font-bold leading-tight">
              Personnel Management<br />System
            </h2>
            <p className="text-gray-300 text-lg max-w-md">
              Secure, efficient, and integrated platform for managing battalion personnel,
              training, and documentation.
            </p>
          </div>

          {/* Footer */}
          <div className="text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} 301st RRIBn. All rights reserved.</p>
            <p className="mt-1">Philippine Army Reserve Command</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <Image
              src="/images/logo.jpg"
              alt="301st RRIBn Logo"
              width={60}
              height={60}
              className="rounded-full"
            />
            <div className="text-center">
              <div className="text-yellow-500 font-bold text-sm tracking-wider">
                301st READY RESERVE
              </div>
              <div className="text-navy-900 font-semibold text-xs">
                INFANTRY BATTALION
              </div>
            </div>
          </Link>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy-900 mb-2">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>
    </div>
  );
};
