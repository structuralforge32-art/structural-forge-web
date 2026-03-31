import ContactForm from '@/components/ContactForm';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="section-container hero-section">
        <h1 className="hero-title">
          <span className="neon-text">STRUCTURAL</span> FORGE
        </h1>
        <p className="hero-subtitle neon-text" style={{letterSpacing: '3px', textTransform: 'uppercase', fontSize: '1rem', fontWeight: 'bold'}}>
          IMPRIMER L'EXCELLENCE, FORGER LA DURÉE
        </p>
        <p className="hero-subtitle">
          Donnez vie à vos idées. Nous concevons et imprimons en 3D vos pièces sur mesure avec une précision absolue, pour les professionnels et les particuliers.
        </p>
        <div>
          <a href="#contact" className="neon-button">Obtenir un devis</a>
        </div>
      </section>

      {/* About Section */}
      <section className="section-container" style={{paddingTop: '3rem', paddingBottom: '1rem'}}>
        <div className="glass-panel" style={{margin: '0 auto', maxWidth: '800px', textAlign: 'center'}}>
          <h2 className="neon-text mb-4" style={{fontSize: '2rem', letterSpacing: '-0.02em'}}>L'essence de la Forge</h2>
          <p style={{color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1rem'}}>
            Chaque véhicule a une âme, chaque machine une histoire. Pourtant, trop d'entre elles finissent à l'arrêt, victimes d'un composant introuvable ou d'un catalogue épuisé.
          </p>
          <p style={{color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1rem'}}>
            <strong>Structural Forge</strong> a été créé pour offrir une alternative à l'obsolescence. Nous concevons des pièces sur mesure qui s'adaptent à vos besoins réels, garantissant la solidité et la longévité de vos projets les plus exigeants.
          </p>
          <p style={{color: 'var(--neon-blue)', fontSize: '1.15rem', fontStyle: 'italic', marginTop: '1.5rem', fontWeight: '500'}}>
            "Parce que l'ingéniosité humaine ne devrait jamais être freinée par un manque de pièces."
          </p>
        </div>
      </section>

      {/* Expertise Section (Photos) */}
      <section className="section-container" style={{paddingTop: '4rem', paddingBottom: '2rem'}}>
        
        {/* Concept 1 */}
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center', marginBottom: '6rem'}}>
          <div style={{flex: '1 1 400px'}}>
            <img src="/photo-cao.jpg" alt="Conception CAO 3D" style={{width: '100%', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,229,255,0.05)', border: '1px solid var(--glass-border)'}} />
          </div>
          <div style={{flex: '1 1 400px'}}>
            <h2 className="neon-text mb-4" style={{fontSize: '2rem', letterSpacing: '-0.02em'}}>Modélisation & Ingénierie</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '1rem'}}>
              Nous transformons vos idées ou pièces cassées en modèles 3D numériques ultra-précis.
              Grâce à nos logiciels de CAO professionnels, chaque dimension et chaque tolérance sont
              optimisées pour garantir des performances mécaniques parfaites lors de l'intégration.
            </p>
          </div>
        </div>

        {/* Concept 2 */}
        <div style={{display: 'flex', flexWrap: 'wrap-reverse', gap: '4rem', alignItems: 'center'}}>
          <div style={{flex: '1 1 400px'}}>
            <h2 className="neon-text mb-4" style={{fontSize: '2rem', letterSpacing: '-0.02em'}}>Une précision absolue</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '1rem'}}>
              Chaque impression est méticuleusement contrôlée pour garantir un assemblage 
              et un fonctionnement parfaits. Que ce soit pour de l'outillage industriel résistant ou une pièce 
              automobile introuvable, nous mettons un point d'honneur sur la solidité et la finition.
            </p>
          </div>
          <div style={{flex: '1 1 400px'}}>
            <img src="/photo-print.jpg" alt="Contrôle qualité pièce imprimée" style={{width: '100%', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,229,255,0.05)', border: '1px solid var(--glass-border)'}} />
          </div>
        </div>

        {/* Concept 3 - Scan 3D (New) */}
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center', marginTop: '6rem'}}>
          <div style={{flex: '1 1 400px'}}>
            <img src="/scan-3d.png" alt="Technologie de scan 3D" style={{width: '100%', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,229,255,0.05)', border: '1px solid var(--glass-border)'}} />
          </div>
          <div style={{flex: '1 1 400px'}}>
            <h2 className="neon-text mb-4" style={{fontSize: '2rem', letterSpacing: '-0.02em'}}>Ingénierie Inverse et Scan 3D</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '1rem'}}>
              Le plan originel n'existe plus ou la géométrie de la pièce est trop complexe ? Grâce à la technologie du <strong>scan 3D</strong> aux lasers calibrés, nous pouvons numériser la plupart de vos pièces aux contours difficiles avec une fidélité impressionnante. 
              Cette empreinte servira de base parfaite pour redessiner la pièce ou corriger ses défauts structurels.
            </p>
          </div>
        </div>

      </section>

      {/* Services Section */}
      <section id="services" className="section-container" style={{paddingTop: '3rem'}}>
        <h2 className="text-center neon-text mb-4" style={{fontSize: '2.5rem'}}>Nos Services</h2>
        <div className="services-grid">
          
          <div className="glass-panel service-card cursor-hover" style={{flex: 1}}>
            <div className="service-icon" style={{fontSize: '2.5rem', marginBottom: '1rem'}}>🏎️</div>
            <h3 className="mb-4" style={{fontSize: '1.2rem', fontWeight: '600'}}>Pièces pour l'automobile</h3>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.95rem'}}>
              Reproduction de pièces obsolètes, composants personnalisés ou améliorations techniques. Nous modélisons et imprimons des pièces robustes adaptées aux contraintes mécaniques de votre véhicule.
            </p>
          </div>

          <div className="glass-panel service-card cursor-hover" style={{flex: 1}}>
            <div className="service-icon" style={{fontSize: '2.5rem', marginBottom: '1rem'}}>🔧</div>
            <h3 className="mb-4" style={{fontSize: '1.2rem', fontWeight: '600'}}>Outillages / Consommables</h3>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.95rem'}}>
              Création d'outils sur-mesure pour votre atelier, gabarits de perçage, supports d'outillage ou pièces d'usure de remplacement pour optimiser votre flux de travail.
            </p>
          </div>

          <div className="glass-panel service-card cursor-hover" style={{flex: 1}}>
            <div className="service-icon" style={{fontSize: '2.5rem', marginBottom: '1rem'}}>⚙️</div>
            <h3 className="mb-4" style={{fontSize: '1.2rem', fontWeight: '600'}}>Autres Projets</h3>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.95rem'}}>
              Vous avez un besoin spécifique pour l'industrie, le prototypage ou le loisir ? Nous étudions toute demande de conception 3D et impression avec les meilleurs matériaux du marché.
            </p>
          </div>

        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-container">
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          <div className="text-center mb-4">
            <h2 className="neon-text" style={{fontSize: '2.5rem', marginBottom: '1rem'}}>Lancer un projet</h2>
            <p style={{color: 'var(--text-secondary)'}}>
              Remplissez le formulaire ci-dessous avec le maximum de détails. Notre équipe étudiera votre demande et vous recontactera rapidement avec une proposition adaptée.
            </p>
            <p style={{color: 'var(--neon-blue)', fontWeight: 'bold', margin: '1rem 0 2rem 0'}}>
              Thomas Laborde - 07 68 17 68 86
            </p>
          </div>
          
          <ContactForm />
          
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{borderTop: '1px solid var(--glass-border)', padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.5)'}}>
        <p style={{color: 'var(--text-secondary)', marginBottom: '10px'}}>© {new Date().getFullYear()} Structural Forge. Tous droits réservés.</p>
        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Contact : structural.forge32@gmail.com</p>
      </footer>
    </main>
  );
}
