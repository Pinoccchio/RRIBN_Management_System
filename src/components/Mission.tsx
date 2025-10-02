'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Container } from './ui/Container';

const aboutImages = [
  '/images/hero/53bb92d2-ca6d-4179-bff5-250142b5f437.jpg',
  '/images/hero/bece77fb-df31-443c-93a4-8010c14d4f73.jpg',
  '/images/hero/d308b8c7-3069-45ee-a7f9-bdd2cf5dd0f2.jpg',
  '/images/hero/daf3f2cd-e46a-4a22-b6d0-b952bc856e5f.jpg',
];

export const Mission: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % aboutImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="about" className="py-20 bg-gray-50">
      <Container maxWidth="xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-sm text-red-500 font-semibold tracking-widest mb-4">
            ABOUT US
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Our Mission & Heritage
          </h3>
          <div className="w-24 h-1 bg-yellow-500 mx-auto"></div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Image Carousel */}
          <div className="relative h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-xl">
            {aboutImages.map((image, index) => (
              <Image
                key={image}
                src={image}
                alt="301st RRIBn Training"
                fill
                className={`object-cover transition-opacity duration-1000 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
          </div>

          {/* Right: Content */}
          <div className="space-y-8">
            <div>
              <h4 className="text-2xl font-bold text-navy-900 mb-4">
                Excellence in Readiness
              </h4>
              <p className="text-gray-700 leading-relaxed mb-4">
                The 301st Ready Reserve Infantry Battalion stands as a pillar of national
                defense, comprised of trained citizen-soldiers prepared to augment the
                regular force in times of need.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Established under the Reserve Force of the Philippine Army, our battalion
                maintains operational readiness through regular training, professional
                development, and community integration.
              </p>
            </div>

            {/* Vision & Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Our Vision */}
              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h5 className="text-lg font-bold text-navy-900 mb-2">Our Vision</h5>
                <p className="text-gray-600 text-sm leading-relaxed">
                  A professional, responsive, and capable reserve force that complements the
                  regular force
                </p>
              </div>

              {/* Our Values */}
              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h5 className="text-lg font-bold text-navy-900 mb-2">Our Values</h5>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Patriotism, Honor, Duty, Service Excellence, and Professionalism
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
