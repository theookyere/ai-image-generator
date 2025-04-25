import './globals.css';

export const metadata = {
  title: 'AI Image Generator',
  description: 'Generate stunning images with AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
