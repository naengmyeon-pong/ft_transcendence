import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Naeng-myeon pong',
  description: 'Play naeng-myeon pong',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
