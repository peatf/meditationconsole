export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, 
  user-scalable=no, maximum-scale=1.0" />
        <title>Meditation Console</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
