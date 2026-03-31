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

// Helper pour compresser les images avant envoi (Base64 optimisé)
const compressImage = (base64Str, maxWidth = 1000, maxHeight = 1000) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7)); // Qualité 70% pour un poids plume
    };
  });
};

// Composant Chat Partagé
function LeadChat({ lead, isAdmin, onUpdate }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const url = isAdmin ? `/api/admin/leads` : `/api/suivi/${lead.token}`;
      const res = await fetch(url);
      const result = await res.json();
      
      if (res.ok) {
        const remoteMessagesStr = isAdmin 
          ? result.find(l => l.id === lead.id)?.messages 
          : result.lead?.messages;
        
        let remoteMessages = [];
        try {
          remoteMessages = typeof remoteMessagesStr === 'string' ? JSON.parse(remoteMessagesStr) : remoteMessagesStr;
        } catch(e) {}

        if (Array.isArray(remoteMessages) && JSON.stringify(remoteMessages) !== JSON.stringify(messages)) {
          setMessages(remoteMessages);
          if (onUpdate) onUpdate(remoteMessages);
        }
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  };

  useEffect(() => {
    if (lead.messages) {
      try {
        setMessages(typeof lead.messages === 'string' ? JSON.parse(lead.messages) : lead.messages);
      } catch (e) {
        setMessages([]);
      }
    }
  }, [lead.messages]);

  // Polling Temps Réel (toutes les 5 secondes)
  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [messages, lead.id, lead.token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (imageContent = null) => {
    if (!newMessage.trim() && !imageContent) return;
    setIsSending(true);

    let finalImage = imageContent;
    if (imageContent) {
      finalImage = await compressImage(imageContent);
    }

    const msgObj = {
      sender: isAdmin ? 'admin' : 'client',
      text: newMessage,
      type: finalImage ? 'image' : 'text',
      image: finalImage,
      timestamp: new Date().toISOString()
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
        const newM = result.messages;
        setMessages(newM);
        if (onUpdate) onUpdate(newM);
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
    const reader = new FileReader();
    reader.onloadend = () => {
      sendMessage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const chatHeight = isExpanded ? '92vh' : '550px';

  return (
    <div className="chat-container" style={{ 
      display: 'flex', flexDirection: 'column', height: chatHeight, 
      background: 'rgba(0,0,0,0.6)', borderRadius: '12px', 
      border: '1px solid var(--glass-border)', overflow: 'hidden', 
      transition: 'all 0.4s ease',
      boxShadow: isExpanded ? '0 0 100px rgba(0,0,0,0.8)' : 'none',
      position: isExpanded ? 'fixed' : 'relative',
      top: isExpanded ? '4vh' : 'auto',
      left: isExpanded ? '4%' : 'auto',
      width: isExpanded ? '92%' : '100%',
      zIndex: isExpanded ? 1000 : 1
    }}>
      <div className="chat-header" style={{ padding: '12px 15px', background: 'rgba(255,255,255,0.08)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--neon-blue)' }}>🖋️ Échanges avec l'Expert</span>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid var(--neon-blue)', color: 'var(--neon-blue)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
          >
            {isExpanded ? '⤫ Réduire' : '⤢ Agrandir'}
          </button>
        </div>
      </div>

      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '40px' }}>
            Aucun message. Une question ? Écrivez-nous !
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = (!isAdmin && msg.sender === 'client') || (isAdmin && msg.sender === 'admin');
          return (
            <div key={i} style={{ 
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              maxWidth: isExpanded ? '70%' : '85%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMe ? 'flex-end' : 'flex-start'
            }}>
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                background: isMe ? '#ffc800' : 'rgba(255,255,255,0.12)',
                color: isMe ? '#000' : '#fff',
                fontSize: '0.95rem',
                boxShadow: isMe ? '0 0 15px rgba(255,200,0,0.2)' : 'none'
              }}>
                {msg.type === 'image' ? (
                  <img src={msg.image} alt="Upload" style={{ maxWidth: '100%', borderRadius: '10px', cursor: 'pointer', display: 'block' }} onClick={() => window.open(msg.image)} />
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

      <div className="chat-input" style={{ 
        padding: '12px', 
        background: 'rgba(255,255,255,0.1)', 
        borderTop: '1px solid var(--glass-border)', 
        display: 'flex', 
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'nowrap'
      }}>
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileUpload}
        />
        <button 
          onClick={() => fileInputRef.current.click()}
          style={{ 
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', 
            width: '42px', height: '42px', cursor: 'pointer', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
            flexShrink: 0
          }}
          title="Envoyer une photo"
        >
          📸
        </button>
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Message..."
          style={{ 
            flex: 1, 
            minWidth: '0',
            background: 'rgba(0,0,0,0.3)', 
            border: '1px solid var(--glass-border)', 
            borderRadius: '25px', 
            height: '42px',
            padding: '0 20px', 
            color: '#fff', 
            fontSize: '0.95rem' 
          }}
        />
        <button 
          onClick={() => sendMessage()}
          disabled={isSending || (!newMessage.trim())}
          style={{ 
            background: '#ffc800', color: '#000', border: 'none', borderRadius: '50%', 
            width: '42px', height: '42px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem',
            flexShrink: 0,
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
