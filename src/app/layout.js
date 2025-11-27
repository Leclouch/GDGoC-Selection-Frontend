export const metadata = {
  title: 'Menu Catalog',
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}