import React from 'react';
import { Container } from './ui/Container';
import { Card } from './ui/Card';

export const Features: React.FC = () => {
  const features = [
    {
      number: '01',
      title: 'Personnel Management',
      description: 'Efficiently manage reservist and enlisted personnel records with role-based access control.',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      features: [
        'Personnel profile management',
        'Role-based access control',
        'Record tracking and updates',
      ],
    },
    {
      number: '02',
      title: 'Document Validation',
      description: 'Secure document upload, verification, and management with blockchain-backed immutability.',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      features: [
        'Secure document storage',
        'Blockchain verification',
        'Version control and history',
      ],
    },
    {
      number: '03',
      title: 'Training Tracking',
      description: 'Schedule, manage, and track training sessions and attendance for all personnel.',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      features: [
        'Training calendar management',
        'Attendance tracking',
        'Performance reporting',
      ],
    },
  ];

  return (
    <section id="capabilities" className="py-20 bg-white">
      <Container maxWidth="xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-6 py-2 bg-navy-900 text-white text-sm font-semibold tracking-wider mb-6">
            SECURE. EFFICIENT. INTEGRATED. PERSONNEL MANAGEMENT SYSTEM.
          </div>
          <h2 className="text-sm text-red-500 font-semibold tracking-widest mb-4">
            BATTALION MANAGEMENT SYSTEM
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Administrative Capabilities
          </h3>
          <div className="w-24 h-1 bg-yellow-500 mx-auto mb-8"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Our digital platform enhances the battalion's administrative efficiency
            through modern tools for personnel, training, and documentation
            management.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.number} hover className="overflow-hidden">
              {/* Card Header */}
              <div className="bg-navy-900 px-6 py-8 relative">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-white pr-4">
                    {feature.title}
                  </h4>
                  <span className="text-4xl font-bold text-yellow-500">
                    {feature.number}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Icon */}
                <div className="w-16 h-16 bg-navy-900 rounded-full flex items-center justify-center text-yellow-500 mb-6">
                  {feature.icon}
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                  {feature.description}
                </p>

                {/* Feature List */}
                <ul className="space-y-3">
                  {feature.features.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
};
