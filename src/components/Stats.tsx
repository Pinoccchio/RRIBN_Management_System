import React from 'react';

export const Stats: React.FC = () => {
  const stats = [
    {
      value: '4,000+',
      label: 'ACTIVE PERSONNEL',
    },
    {
      value: '14,000+',
      label: 'OVERALL PERSONNEL',
    },
    {
      value: '45+',
      label: 'YEARS OF SERVICE',
    },
    {
      value: '100%',
      label: 'COMMITMENT TO EXCELLENCE',
    },
  ];

  return (
    <section className="relative bg-navy-900 py-16 md:py-20">
      {/* Top Decorative Lines */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <div className="w-16 h-0.5 bg-yellow-500"></div>
        <div className="w-16 h-0.5 bg-yellow-500"></div>
      </div>

      {/* Stats Grid */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center transition-all duration-300 hover:transform hover:-translate-y-2 hover:scale-105 cursor-pointer"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-yellow-500 mb-3 transition-all duration-300">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm font-semibold text-white tracking-wider transition-all duration-300">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Decorative Lines */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <div className="w-16 h-0.5 bg-yellow-500"></div>
        <div className="w-16 h-0.5 bg-yellow-500"></div>
      </div>
    </section>
  );
};
