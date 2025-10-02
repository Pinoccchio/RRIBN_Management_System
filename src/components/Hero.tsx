'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Container } from './ui/Container';

const heroImages = [
  '/images/hero/53bb92d2-ca6d-4179-bff5-250142b5f437.jpg',
  '/images/hero/bece77fb-df31-443c-93a4-8010c14d4f73.jpg',
  '/images/hero/d308b8c7-3069-45ee-a7f9-bdd2cf5dd0f2.jpg',
  '/images/hero/daf3f2cd-e46a-4a22-b6d0-b952bc856e5f.jpg',
];

export const Hero: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex flex-col pt-20">
      {/* Top Yellow Border */}
      <div className="absolute top-20 left-0 right-0 h-0.5 bg-yellow-500 z-20"></div>

      {/* Background Image Carousel with Lighter Overlay */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
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
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/40 via-navy-900/50 to-navy-900/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full pl-8 md:pl-12 lg:pl-16 xl:pl-20 pr-8">
          <div className="max-w-3xl">
            {/* Text Content */}
            <div className="space-y-6">
              {/* Administrative Portal Label */}
              <div className="text-yellow-500 text-xs md:text-sm font-bold tracking-widest">
                ADMINISTRATIVE PORTAL
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                301st READY<br />
                RESERVE INFANTRY<br />
                BATTALION
              </h1>

              {/* Subtitle */}
              <p className="text-sm md:text-base text-gray-200 max-w-2xl leading-relaxed">
                Personnel Management System for administrators and staff members of the 301st
                Ready Reserve Infantry Battalion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Yellow Border */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500 z-20"></div>
    </section>
  );
};
