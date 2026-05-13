import React from 'react';
import { Card, CardContent } from './ui/card';

/* ── Inline SVG logos — always load, no external CDN dependency ────────── */

const MetaLogo = () => (
  <svg viewBox="0 0 180 50" className="h-8 md:h-10 w-auto">
    {/* Meta infinity symbol */}
    <path d="M25 25c0-8 4-15 10-15s8 5 12 12l3 6 3-6c4-7 6-12 12-12s10 7 10 15-4 15-10 15-8-5-12-12l-3-6-3 6c-4 7-6 12-12 12S25 33 25 25z" fill="#0668E1" stroke="#0668E1" strokeWidth="3" fillOpacity="0"/>
    <text fontFamily="'Helvetica Neue', Arial, sans-serif" fontWeight="700" fontSize="22" y="33" x="82" fill="#0668E1">Meta</text>
  </svg>
);

const GoogleLogo = () => (
  <svg viewBox="0 0 272 92" className="h-8 md:h-10 w-auto">
    <path fill="#4285F4" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.54 12.51-13.44z"/>
    <path fill="#EA4335" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C119.25 34.32 129.24 25 141.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.54 12.51-13.44z"/>
    <path fill="#FBBC05" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
    <path fill="#4285F4" d="M225 3v65h-9.5V3h9.5z"/>
    <path fill="#34A853" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
    <path fill="#EA4335" d="M35.29 41.19V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49-.21z"/>
  </svg>
);

const AmazonLogo = () => (
  <svg viewBox="0 0 300 100" className="h-8 md:h-10 w-auto">
    <text fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="48" y="55" x="20" fill="currentColor" letterSpacing="-1">amazon</text>
    <path d="M45 72 C80 92, 180 95, 230 72" fill="none" stroke="#FF9900" strokeWidth="5" strokeLinecap="round"/>
    <path d="M218 62 L232 72 L220 78" fill="none" stroke="#FF9900" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NetflixLogo = () => (
  <svg viewBox="0 0 120 40" className="h-8 md:h-10 w-auto">
    <text fontFamily="'Arial Black', 'Helvetica Neue', Arial, sans-serif" fontWeight="900" fontSize="36" y="32" x="5" fill="#E50914" letterSpacing="3">NETFLIX</text>
  </svg>
);

const AppleLogo = () => (
  <svg viewBox="0 0 384 512" className="h-8 md:h-10 w-auto" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);

const InfosysLogo = () => (
  <svg viewBox="0 0 200 40" className="h-8 md:h-10 w-auto" fill="currentColor">
    <text fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="28" y="30" x="10" fill="currentColor" fontStyle="italic">Infosys</text>
  </svg>
);

const TCSLogo = () => (
  <svg viewBox="0 0 200 50" className="h-8 md:h-10 w-auto" fill="currentColor">
    <text fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="14" y="20" x="10" letterSpacing="2">TATA CONSULTANCY</text>
    <text fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="14" y="38" x="40" letterSpacing="2">SERVICES</text>
  </svg>
);

const JPMorganLogo = () => (
  <svg viewBox="0 0 300 55" className="h-8 md:h-10 w-auto">
    {/* JP Morgan Chase octagon mark */}
    <g transform="translate(5, 3)">
      <path d="M24 0L36 0L48 12L48 24L36 36L24 36L12 24L12 12Z" fill="#1A73E8" />
      <path d="M22 8L30 8L38 16L38 24L30 32L22 32L14 24L14 16Z" fill="white" />
      <path d="M24 12L30 12L34 16L34 22L30 26L24 26L20 22L20 16Z" fill="#1A73E8" />
    </g>
    <text fontFamily="Georgia, 'Times New Roman', serif" fontWeight="400" fontSize="22" y="30" x="60" fill="currentColor" letterSpacing="0.5">J.P. Morgan</text>
  </svg>
);

const MastercardLogo = () => (
  <svg viewBox="0 0 131.39 86.9" className="h-8 md:h-10 w-auto">
    <circle fill="#EB001B" cx="43.45" cy="43.45" r="43.45"/>
    <circle fill="#F79E1B" cx="87.94" cy="43.45" r="43.45"/>
    <path fill="#FF5F00" d="M65.7 11.35a43.35 43.35 0 0 0-16.15 32.1 43.35 43.35 0 0 0 16.15 32.1 43.35 43.35 0 0 0 16.15-32.1A43.35 43.35 0 0 0 65.7 11.35z"/>
  </svg>
);

const MicrosoftLogo = () => (
  <svg viewBox="0 0 23 23" className="h-8 md:h-10 w-auto">
    <rect fill="#F25022" x="0" y="0" width="11" height="11"/>
    <rect fill="#7FBA00" x="12" y="0" width="11" height="11"/>
    <rect fill="#00A4EF" x="0" y="12" width="11" height="11"/>
    <rect fill="#FFB900" x="12" y="12" width="11" height="11"/>
  </svg>
);

const firms = [
  { name: 'Meta', Logo: MetaLogo },
  { name: 'Google', Logo: GoogleLogo },
  { name: 'Amazon', Logo: AmazonLogo },
  { name: 'Netflix', Logo: NetflixLogo },
  { name: 'Apple', Logo: AppleLogo },
  { name: 'Infosys', Logo: InfosysLogo },
  { name: 'TCS', Logo: TCSLogo },
  { name: 'J.P. Morgan', Logo: JPMorganLogo },
  { name: 'Mastercard', Logo: MastercardLogo },
  { name: 'Microsoft', Logo: MicrosoftLogo },
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

        <Card className="max-w-5xl mx-auto border border-border/50 shadow-xl bg-white dark:bg-slate-800">
          <CardContent className="p-8 sm:p-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center">
              {firms.map((firm) => (
                <div 
                  key={firm.name} 
                  className="group relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:shadow-lg"
                >
                  <div className="text-gray-800 dark:text-gray-100 transition-all duration-300 group-hover:scale-110">
                    <firm.Logo />
                  </div>
                  <span className="mt-2 text-xs font-medium text-gray-600 dark:text-gray-300">
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
