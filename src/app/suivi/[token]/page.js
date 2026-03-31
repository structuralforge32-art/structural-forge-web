'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';

const STEPS = [
  "Création du projet",
  "Validation de faisabilité",
  "Devis",
  "Modélisation 3D",
  "Prototypage",
  "Impression finale",
  "Facturation",
  "Terminé"
];

export default function SuiviProjet({ params }) {
  const unwrappedParams = use(params);
  const token = unwrappedParams.token;
  
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [clientNotes, setClientNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/suivi/${token}`);
        const result = await res.json();
        
        if (res.ok) {
          setData(result.lead);
          setClientNotes(result.lead.client_notes || '');
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Erreur de connexion.');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [token]);

  if (loading) {
    return (
      <main className="section-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 className="neon-text">Chargement de votre projet...</h2>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="section-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel text-center">
          <h2 style={{color: '#ff4444', marginBottom: '1rem'}}>Accès Refusé / Introuvable</h2>
          <p style={{color: 'var(--text-secondary)'}}>{error || "Ce numéro de projet n'existe pas."}</p>
        </div>
      </main>
    );
  }

  const currentStepIndex = STEPS.indexOf(data.status);
  
  let historyDict = {};
  if (data.history) {
    try {
      historyDict = JSON.parse(data.history);
    } catch(e) {}
  }

  const saveClientNotes = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/suivi/${token}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_notes: clientNotes })
      });
      if (res.ok) {
        alert('Vos précisions ont été enregistrées !');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <main className="section-container" style={{ minHeight: '100vh', paddingTop: '8rem', maxWidth: '900px', margin: '0 auto' }}>
      
      <div className="glass-panel mb-4 text-center">
        <h1 className="neon-text mb-4" style={{fontSize: '2rem'}}>Projet : {data.type}</h1>
        <p style={{color: 'var(--text-secondary)'}}>Client : {data.name}</p>
        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Débuté le : {new Date(data.created_at).toLocaleDateString('fr-FR')}</p>
      </div>

      <div className="glass-panel">
        <h2 className="mb-4" style={{fontSize: '1.5rem', textAlign: 'center'}}>Suivi d'Avancement</h2>
        
        <div className="timeline-container" style={{marginTop: '3rem', position: 'relative'}}>
          {/* Ligne verticale de fond */}
          <div style={{
            position: 'absolute',
            left: '20px',
            top: '0',
            bottom: '0',
            width: '2px',
            background: 'var(--glass-border)',
            zIndex: 0
          }}></div>

          {STEPS.map((step, index) => {
            const isCompleted = currentStepIndex !== -1 && index < currentStepIndex;
            const isActive = index === currentStepIndex;
            const isPending = currentStepIndex !== -1 && index > currentStepIndex;
            // Si on ne trouve pas le statut, on grise tout.
            const isUnknownState = currentStepIndex === -1;

            let color = 'var(--text-secondary)';
            let dotColor = 'var(--dark-glass)';
            let dotBorder = 'var(--glass-border)';
            let icon = '';
            
            if (isCompleted) {
              color = '#fff';
              dotColor = 'var(--neon-blue)';
              dotBorder = 'var(--neon-blue)';
              icon = '✓';
            } else if (isActive) {
              color = 'var(--neon-blue)';
              dotColor = 'var(--neon-blue)';
              dotBorder = 'var(--neon-blue)';
            }

            // On ne montre pas le step "Terminé" comme un point à part si pas nécessaire, 
            // mais ici on a la liste donc on l'affiche
            return (
              <div key={step} style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: index === STEPS.length - 1 ? '0' : '2.5rem',
                position: 'relative',
                zIndex: 1,
                opacity: (isPending || isUnknownState) ? 0.4 : 1
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: dotColor,
                  border: `2px solid ${dotBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompleted ? '#000' : 'transparent',
                  fontWeight: 'bold',
                  boxShadow: isActive ? '0 0 15px var(--neon-blue-glow)' : 'none',
                  flexShrink: 0,
                  transition: 'all 0.3s ease'
                }}>
                  {icon}
                </div>
                <div style={{ marginLeft: '20px' }}>
                  <h3 style={{
                    color: color, 
                    margin: 0, 
                    fontSize: '1.1rem',
                    textShadow: isActive ? '0 0 10px var(--neon-blue-glow)' : 'none'
                  }}>
                    {step}
                  </h3>
                  {historyDict[step] && (
                    <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px'}}>
                      {isActive ? 'Démarré le ' : 'Validé le '} {new Date(historyDict[step]).toLocaleString('fr-FR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      }).replace(':', 'h')}
                    </div>
                  )}
                  {isActive && <span style={{fontSize: '0.8rem', color: 'var(--neon-blue)', opacity: 0.8, display: 'block', marginTop: '4px'}}>En cours d'exécution...</span>}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Espace d'échange / Notes */}
      <div className="glass-panel mt-8">
        <h2 className="mb-4" style={{fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px'}}>
          <span>🖋️</span> Espace d'Échange
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--neon-blue)', marginBottom: '10px', fontWeight: 'bold' }}>👤 Notes de l'Expert Structural Forge</label>
            <div style={{ 
              padding: '1.2rem', background: 'rgba(0,229,255,0.05)', borderRadius: '8px', 
              border: '1px solid var(--glass-border)', minHeight: '120px', color: '#fff',
              fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: '1.5'
            }}>
              {data.admin_notes || "L'expert n'a pas encore laissé de notes particulières pour cette étape."}
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: '#ffc800', marginBottom: '10px', fontWeight: 'bold' }}>💬 Vos Précisions / Questions</label>
            <textarea 
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              placeholder="Besoin d'une modification ? Une question ?"
              className="form-input"
              style={{ minHeight: '120px', background: 'rgba(255, 200, 0, 0.03)', border: '1px solid rgba(255, 200, 0, 0.2)', fontSize: '0.9rem' }}
            />
            <button 
              onClick={saveClientNotes}
              disabled={isSaving}
              className="neon-button"
              style={{ 
                marginTop: '10px', width: '100%', padding: '8px', 
                background: 'rgba(255, 200, 0, 0.1)', color: '#ffc800', 
                border: '1px solid rgba(255, 200, 0, 0.4)', fontSize: '0.85rem'
              }}
            >
              {isSaving ? 'Enregistrement...' : '✉️ Enregistrer mes précisions'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
