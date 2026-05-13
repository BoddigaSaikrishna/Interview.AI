import React from 'react';
import { Card, CardContent } from './ui/card';

/* ── Inline SVG logos — always load, no external CDN dependency ────────── */

const MetaLogo = () => (
  <svg viewBox="0 0 512 512" className="h-8 md:h-10 w-auto" fill="currentColor">
    <path d="M355.6 304.6c19.1 31.4 39.7 55.5 57.7 55.5 13.6 0 22.7-14 22.7-46.8 0-69.5-40.3-152.4-88.8-205.1-30.5-33.1-62.4-50.2-89.7-50.2-38.5 0-65.4 36.8-96.5 98.6l-7.6 15.2C128.2 228.2 108.6 269 93 297.4c-23.4 42.6-42.6 62.7-67.1 62.7v56c44.4 0 75.3-26.9 105.7-82.4 10.2-18.6 21-40.7 33.1-66.7l7.7-15.4C200.4 191 223.7 148 245.5 148c20.3 0 48.3 41.4 72.4 84.6l10.8 18.9c10.4 18 19.6 34.6 26.9 53.1zm0 0" />
  </svg>
);

const GoogleLogo = () => (
  <svg viewBox="0 0 488 512" className="h-8 md:h-10 w-auto">
    <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
  </svg>
);

const AmazonLogo = () => (
  <svg viewBox="0 0 300 100" className="h-8 md:h-10 w-auto">
    {/* "amazon" text */}
    <text fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="48" y="55" x="20" fill="currentColor" letterSpacing="-1">amazon</text>
    {/* Smile arrow */}
    <path d="M45 72 C80 92, 180 95, 230 72" fill="none" stroke="#FF9900" strokeWidth="5" strokeLinecap="round"/>
    <path d="M218 62 L232 72 L220 78" fill="none" stroke="#FF9900" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NetflixLogo = () => (
  <svg viewBox="0 0 111 30" className="h-8 md:h-10 w-auto">
    <path fill="#E50914" d="M105.06 1.519l-.005.013v.005l-3.398 8.929 3.482 9.14v.009l.009.014c.648 1.707.651 3.238.07 4.244-.704 1.22-2.17 1.675-3.095 1.755l-.062.005-.056.022-1.6.644-.005.002 3.512 3.152.235-.051c2.004-.432 3.778-1.63 4.85-3.487 1.082-1.876 1.264-4.202.296-6.75l-.012-.032-7.22-18.614zM89.21 1.087L83.6 16.073 77.85 1.087H71.476l.005.013v28.318h5.068V13.203l4.482 11.76h5.148l4.493-11.832v16.287h5.069V1.1h-6.53zM42.982 1.087v5.069h6.938v23.262h5.49V6.156h6.938V1.087H42.982zM22.723 24.418V16.49h8.684v-5.069h-8.684V6.156h10.129V1.087H17.232v28.331h15.921v-5.069H22.723l.001.069zm86.334-6.46c0 0 0 0 0 0zM17.078 29.418h-.005.005zM.378 1.087v28.331h5.49V16.49h7.427v-5.069H5.868V6.156h9.553V1.087H.378zM111 1.087v28.331h-5.39V1.087H111z"/>
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
  <svg viewBox="0 0 300 80" className="h-8 md:h-10 w-auto">
    {/* JP Morgan octagonal symbol */}
    <g transform="translate(10, 5)">
      <polygon points="35,0 55,0 70,15 70,35 55,50 35,50 20,35 20,15" fill="none" stroke="currentColor" strokeWidth="3"/>
      <polygon points="35,8 55,8 64,17 64,33 55,42 35,42 26,33 26,17" fill="currentColor" opacity="0.15"/>
    </g>
    {/* Text */}
    <text fontFamily="Georgia, 'Times New Roman', serif" fontWeight="400" fontSize="24" y="38" x="90" fill="currentColor" letterSpacing="1">J.P.Morgan</text>
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

        <Card className="max-w-5xl mx-auto border-0 shadow-card bg-white/50 backdrop-blur-sm">
          <CardContent className="p-8 sm:p-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center">
              {firms.map((firm) => (
                <div 
                  key={firm.name} 
                  className="group relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 hover:bg-white hover:shadow-soft"
                >
                  <div className="opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300 text-gray-800">
                    <firm.Logo />
                  </div>
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
