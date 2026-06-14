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
        <h1 className="neon-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Études de Cas</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Découvrez comment nous avons résolu des problèmes d'ingénierie complexes grâce à l'impression 3D. 
          Du besoin initial jusqu'à la pièce finale fonctionnelle.
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
                {etude.image_url ? (
                  <div style={{ position: 'relative', aspectRatio: '16/9', width: '100%' }}>
                    <Image 
                      src={etude.image_url} 
                      alt={etude.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div style={{ aspectRatio: '16/9', width: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    Pas d'image d'illustration
                  </div>
                )}
                
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
