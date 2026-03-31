'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Realisations() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/admin/gallery');
        const data = await res.json();
        setImages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erreur chargement galerie:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return (
    <main className="section-container" style={{ paddingTop: '8rem', minHeight: '100vh' }}>
      
      <div className="text-center" style={{ marginBottom: '4rem' }}>
        <h1 className="neon-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Nos Réalisations</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Explorez les pièces complexes et sur-mesure conçues et imprimées pour nos clients. 
          Chaque projet est unique, chaque solution est forgée avec précision.
        </p>
      </div>

      {loading ? (
        <p className="text-center" style={{ color: 'var(--text-secondary)' }}>Chargement des créations...</p>
      ) : images.length === 0 ? (
        <div className="text-center" style={{ color: 'var(--text-secondary)', padding: '4rem' }}>
          <p>La galerie est en cours de mise à jour.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          padding: '0 2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {images.map((img, index) => (
            <div key={img.id} style={{
              position: 'relative',
              aspectRatio: '4/3',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            className="gallery-item"
            >
              <Image 
                src={img.url} 
                alt={img.caption}
                fill
                style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
                className="gallery-image"
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '1.5rem',
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                color: 'white',
                transform: 'translateY(100%)',
                transition: 'transform 0.3s ease'
              }}
              className="gallery-caption"
              >
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontFamily: 'var(--font-orbitron)' }}>{img.caption}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .gallery-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px var(--neon-blue-glow);
          border-color: var(--neon-blue);
        }
        .gallery-item:hover .gallery-image {
          transform: scale(1.05);
        }
        .gallery-item:hover .gallery-caption {
          transform: translateY(0);
        }
      `}} />
    </main>
  );
}
