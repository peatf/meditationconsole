// app/layout.jsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <title>Meditation Console</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
