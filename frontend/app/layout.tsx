import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MCP Web Analyzer — Autonomous AI Website Intelligence',
  description: 'Analyze any website link in depth using Model Context Protocol (MCP) tools and AI intelligence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body>
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
