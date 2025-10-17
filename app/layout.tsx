import './globals.css';
import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'SocialAI - AI-Powered Social Media Management',
  description: 'Manage your social media presence with AI-powered content generation and scheduling',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Skip link for keyboard navigation */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        
        <main id="main-content">
        {children}
        </main>
        
        {/* User experience enhancements */}
       
       
     
      </body>
    </html>
  );
}
