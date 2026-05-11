import React from 'react';
import { Card, CardContent } from './ui/card';

const firms = [
  { name: 'Meta', logo: 'https://cdn.simpleicons.org/meta/0668E1' },
  { name: 'Google', logo: 'https://cdn.simpleicons.org/google/4285F4' },
  { name: 'Amazon', logo: 'https://cdn.simpleicons.org/amazon/FF9900' },
  { name: 'Netflix', logo: 'https://cdn.simpleicons.org/netflix/E50914' },
  { name: 'Apple', logo: 'https://cdn.simpleicons.org/apple/000000' },
  { name: 'Infosys', logo: 'https://cdn.simpleicons.org/infosys/007CC3' },
  { name: 'TCS', logo: 'https://cdn.simpleicons.org/tata/1254A2' },
  { name: 'J.P. Morgan', logo: 'https://cdn.simpleicons.org/jpmorgan/231F20' },
  { name: 'Mastercard', logo: 'https://cdn.simpleicons.org/mastercard/EB001B' },
];

export const FirmsSection: React.FC = () => {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6">
            Get Ready for Jobs at <span className="text-gradient">Leading Firms</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            InterviewAI users trust our advanced mock interview platform to prepare for opportunities 
            at leading companies. Hone your skills with realistic simulations and get ready to 
            succeed at top employers like those featured below and many more!
          </p>
        </div>

        <Card className="max-w-5xl mx-auto border-0 shadow-card bg-white/50 backdrop-blur-sm">
          <CardContent className="p-8 sm:p-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center">
              {firms.map((firm) => (
                <div 
                  key={firm.name} 
                  className="group relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 hover:bg-white hover:shadow-soft"
                >
                  <img 
                    src={firm.logo} 
                    alt={`${firm.name} logo`}
                    className="h-8 md:h-10 w-auto opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
                  />
                  <span className="mt-2 text-xs font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {firm.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
