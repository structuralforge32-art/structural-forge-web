'use client';
import React, { useState, useEffect, useRef } from 'react';
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

// Composant Chat Partagé
function LeadChat({ lead, isAdmin, onUpdate }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (lead.messages) {
      try {
        setMessages(typeof lead.messages === 'string' ? JSON.parse(lead.messages) : lead.messages);
      } catch (e) {
        setMessages([]);
      }
    }
  }, [lead.messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (imageContent = null) => {
    if (!newMessage.trim() && !imageContent) return;
    setIsSending(true);

    const msgObj = {
      sender: isAdmin ? 'admin' : 'client',
      text: newMessage,
      type: imageContent ? 'image' : 'text',
      image: imageContent,
    };

    try {
      const url = isAdmin ? '/api/admin/leads' : `/api/suivi/${lead.token}/notes`;
      const res = await fetch(url, {
        method: isAdmin ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: lead.id, 
          message: msgObj 
        })
      });
      const result = await res.json();
      if (res.ok) {
        setNewMessage('');
        if (onUpdate) onUpdate(result.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("L'image est trop lourde (max 2Mo)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      sendMessage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="chat-container" style={{ display: 'flex', flexDirection: 'column', height: '500px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
      <div className="chat-header" style={{ padding: '12px 15px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--neon-blue)' }}>🖋️ Espace d'Échange avec l'Expert</span>
      </div>

      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '40px' }}>
            Aucun message. Posez vos questions ici !
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = (!isAdmin && msg.sender === 'client') || (isAdmin && msg.sender === 'admin');
          return (
            <div key={i} style={{ 
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMe ? 'flex-end' : 'flex-start'
            }}>
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                background: isMe ? '#ffc800' : 'rgba(255,255,255,0.1)',
                color: isMe ? '#000' : '#fff',
                fontSize: '0.95rem',
                boxShadow: isMe ? '0 0 15px rgba(255,200,0,0.2)' : 'none'
              }}>
                {msg.type === 'image' ? (
                  <img src={msg.image} alt="Upload" style={{ maxWidth: '100%', borderRadius: '10px', cursor: 'pointer' }} onClick={() => window.open(msg.image)} />
                ) : (
                  msg.text
                )}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                {msg.sender === 'admin' ? '👷 Expert Forge' : '👤 Vous'} • {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input" style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px' }}>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileUpload}
        />
        <button 
          onClick={() => fileInputRef.current.click()}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '42px', height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}
          title="Envoyer une photo"
        >
          📸
        </button>
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Écrivez vos précisions..."
          style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '25px', padding: '0 20px', color: '#fff', fontSize: '0.95rem' }}
        />
        <button 
          onClick={() => sendMessage()}
          disabled={isSending || (!newMessage.trim())}
          style={{ 
            background: '#ffc800', color: '#000', border: 'none', borderRadius: '50%', 
            width: '42px', height: '42px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem',
            opacity: isSending || !newMessage.trim() ? 0.5 : 1
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default function SuiviProjet({ params }) {
  const unwrappedParams = use(params);
  const token = unwrappedParams.token;
  
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/suivi/${token}`);
        const result = await res.json();
        
        if (res.ok) {
          setData(result.lead);
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

      {/* Chat Collaboratif avec Expert */}
      <div className="glass-panel" style={{ marginTop: '2rem' }}>
        <LeadChat 
          lead={data} 
          isAdmin={false} 
          onUpdate={(newMessages) => setData(prev => ({...prev, messages: newMessages}))} 
        />
        
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--neon-blue)', marginBottom: '10px', fontWeight: 'bold' }}>👤 Notes Finales de l'Expert</label>
          <div style={{ 
            padding: '1.2rem', background: 'rgba(0,229,255,0.05)', borderRadius: '8px', 
            border: '1px solid var(--glass-border)', color: '#fff',
            fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: '1.5'
          }}>
            {data.admin_notes || "L'expert centralisera ici vos décisions finales."}
          </div>
        </div>
      </div>
    </main>
  );
}
