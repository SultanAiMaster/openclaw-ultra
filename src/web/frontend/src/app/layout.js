import './globals.css';

export const metadata = {
  title: 'OpenClaw Ultra - AI Chat',
  description: 'Self-hosted AI powered by Groq',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
