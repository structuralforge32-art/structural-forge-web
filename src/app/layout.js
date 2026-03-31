import './globals.css'
import { Orbitron, Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })

export const metadata = {
  title: 'Structural Forge | Impression 3D sur Mesure',
  description: 'Entreprise de conception et impression 3D de pièces sur mesure. Forgez la matière avec la technologie de demain.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${inter.variable} ${orbitron.variable}`}>
      <body>
        <div className="bg-logo-watermark"></div>
        <nav className="navbar">
          <a href="/" className="navbar-brand">
            <span className="neon-text">STRUCTURAL</span> FORGE
          </a>
          <div>
            <a href="/realisations" style={{color: '#fff', textDecoration: 'none', marginRight: '30px', fontWeight: '500'}}>Réalisations</a>
            <a href="/#contact" className="neon-button" style={{padding: '8px 20px', fontSize: '0.85rem'}}>Demander un devis</a>
          </div>
        </nav>
        
        {children}

        <footer style={{
          marginTop: '5rem',
          padding: '2rem',
          borderTop: '1px solid var(--glass-border)',
          background: 'rgba(5, 7, 15, 0.8)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <span className="neon-text" style={{ fontSize: '1.2rem', fontFamily: 'var(--font-orbitron)' }}>STRUCTURAL FORGE</span> © 2026
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.9rem' }}>
            <a href="/mentions-legales" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Mentions Légales</a>
            <a href="/cgv" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Règlement & CGV</a>
            <a href="/admin" style={{ color: 'var(--neon-blue)', textDecoration: 'none', opacity: 0.7 }}>Accès Admin</a>
          </div>
        </footer>
      </body>
    </html>
  )
}
