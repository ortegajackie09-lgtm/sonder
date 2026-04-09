import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'sonder',
  description: 'music from people you trust',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; background: #f0ebe4; font-family: sans-serif; }
          .app-shell { 
            max-width: 760px; 
            margin: 0 auto; 
            background: #ffffff; 
            min-height: 100vh;
          }
          @media (max-width: 600px) {
            .app-shell { max-width: 100%; }
          }
        `}</style>
      </head>
      <body>
        <div className="app-shell">
          {children}
        </div>
      </body>
    </html>
  )
}