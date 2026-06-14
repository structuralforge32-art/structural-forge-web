'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function EtudesDeCasList() {
  const [etudes, setEtudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEtudes = async () => {
      try {
        const res = await fetch('/api/etudes-de-cas');
        const data = await res.json();
        setEtudes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erreur chargement études:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEtudes();
  }, []);

  return (
    <main className="section-container" style={{ paddingTop: '8rem', minHeight: '100vh' }}>
      <div className="text-center" style={{ marginBottom: '4rem' }}>
        <h1 className="neon-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Du problème à la solution</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Découvrez comment nous avons transformé les défis de nos clients en solutions concrètes grâce à l'impression 3D.
        </p>
      </div>

      {loading ? (
        <p className="text-center" style={{ color: 'var(--text-secondary)' }}>Chargement des projets...</p>
      ) : etudes.length === 0 ? (
        <div className="text-center" style={{ color: 'var(--text-secondary)', padding: '4rem' }}>
          <p>Aucune étude de cas disponible pour le moment.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          padding: '0 2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {etudes.map((etude) => (
            <Link key={etude.id} href={`/etudes-de-cas/${etude.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              className="gallery-item"
              >
                <div style={{ position: 'relative', height: '200px', width: '100%' }}>
                  {etude.image_url ? (
                    <Image src={etude.image_url} alt={etude.title} fill style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'rgba(0, 229, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'var(--neon-blue)', fontSize: '2rem' }}>🔧</span>
                    </div>
                  )}
                  {/* Badge Status */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    background: etude.status === 'en_cours' ? 'rgba(255, 165, 0, 0.8)' : 'rgba(0, 255, 102, 0.8)',
                    color: '#111',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
                  }}>
                    {etude.status === 'en_cours' ? '⏳ En cours' : '✅ Résolu'}
                  </div>
                </div>  
                
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem', color: '#fff' }}>{etude.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', flex: 1 }}>
                    {etude.problem_text || 'Découvrez les détails de ce projet...'}
                  </p>
                  <div style={{ marginTop: '1.5rem', color: 'var(--neon-blue)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    Lire l'étude ➔
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .gallery-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px var(--neon-blue-glow);
          border-color: var(--neon-blue);
        }
      `}} />
    </main>
  );
}
