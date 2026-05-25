import './globals.css';

export const metadata = {
  title: 'HB Safety Tools',
  description: 'כלי בינה מלאכותית לניהול בטיחות תעסוקתית — HB Learning',
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
