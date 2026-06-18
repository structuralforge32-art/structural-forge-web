import { openDB } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const db = await openDB();
  const etudes = await db.all('SELECT * FROM etudes_de_cas WHERE slug = ?', [slug]);
  const etude = etudes[0];
  
  if (!etude) {
    return { title: 'Étude de cas introuvable' };
  }
  
  return {
    title: `${etude.title} | Structural Forge`,
    description: etude.problem_text?.substring(0, 160) || 'Découvrez cette étude de cas Structural Forge.',
  };
}

export default async function EtudeDeCasDetail({ params }) {
  const { slug } = await params;
  const db = await openDB();
  const etudes = await db.all('SELECT * FROM etudes_de_cas WHERE slug = ?', [slug]);
  const etude = etudes[0];

  if (!etude) {
    notFound();
  }

  return (
    <main className="section-container" style={{ paddingTop: '8rem', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '3rem' }}>
        <Link href="/etudes-de-cas" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem', fontSize: '0.9rem' }}>
          ← Retour
        </Link>
        <h1 className="neon-text" style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: '1.2' }}>{etude.title}</h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            background: etude.status === 'en_cours' ? 'rgba(255, 165, 0, 0.1)' : 'rgba(0, 255, 102, 0.1)',
            color: etude.status === 'en_cours' ? '#FFA500' : '#00FF66',
            border: `1px solid ${etude.status === 'en_cours' ? '#FFA500' : '#00FF66'}`
          }}>
            {etude.status === 'en_cours' ? '⏳ En cours de résolution' : '✅ Problème résolu'}
          </span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Publié le {new Date(etude.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {etude.image_url && (
        <div style={{ maxWidth: '1000px', margin: '0 auto 4rem auto', position: 'relative', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,229,255,0.1)', border: '1px solid var(--glass-border)' }}>
          <Image 
            src={etude.image_url} 
            alt={etude.title}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {etude.problem_text && (
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#ff4444' }}>🛑</span> Le Problème
            </h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', marginBottom: '2rem' }}>
              {etude.problem_text}
            </div>
            {etude.problem_image && (
              <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                <Image src={etude.problem_image} alt="Le problème" fill style={{ objectFit: 'cover' }} />
              </div>
            )}
          </section>
        )}

        {etude.engineering_text && (
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--neon-blue)' }}>⚙️</span> Notre Ingénierie
            </h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', marginBottom: '2rem' }}>
              {etude.engineering_text}
            </div>
            {etude.engineering_image && (
              <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                <Image src={etude.engineering_image} alt="L'ingénierie" fill style={{ objectFit: 'cover' }} />
              </div>
            )}
          </section>
        )}

        {etude.result_text && (
          <section style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#00ff66' }}>✅</span> Le Résultat Final
            </h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', marginBottom: '2rem' }}>
              {etude.result_text}
            </div>
            {etude.result_image && (
              <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                <Image src={etude.result_image} alt="Le résultat" fill style={{ objectFit: 'cover' }} />
              </div>
            )}
          </section>
        )}

        <div className="glass-panel" style={{ textAlign: 'center', marginTop: '4rem' }}>
          <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Un projet similaire ?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Contactez-nous pour discuter de votre besoin et obtenir un devis sur mesure.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/#contact" className="neon-button">
              Demander un devis
            </Link>
            <Link href={`/?ref_article=${encodeURIComponent(etude.title)}#contact`} className="neon-button" style={{ background: 'var(--neon-blue)', color: '#000' }}>
              Commander cette pièce
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
