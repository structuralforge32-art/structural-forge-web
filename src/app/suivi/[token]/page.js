import React, { useState, useEffect, useRef, use } from 'react';
import dynamic from 'next/dynamic';

// On importe le visualiseur 3D dynamiquement pour le charger uniquement côté client
const STLViz = dynamic(() => import('@/components/STLViz'), { 
  ssr: false,
  loading: () => <div style={{ height: '400px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-blue)' }}>Initialisation du moteur 3D...</div>
});

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

// Helper pour ouvrir les fichiers Base64 (PDF/Images) de manière sécurisée
const openBase64File = (base64Data) => {
  if (!base64Data) return;
  try {
    const [header, content] = base64Data.split(',');
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : '';
    const binary = atob(content);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    const blob = new Blob([array], { type: mime });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (e) {
    console.error("Erreur d'ouverture du fichier:", e);
    window.open(base64Data, '_blank');
  }
};

// Composant Signature Pad (Canvas)
function SignaturePad({ onSave, onClear }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    e.preventDefault();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (onClear) onClear();
  };

  const save = () => {
    const canvas = canvasRef.current;
    // Vérifier si le canvas est vide (optionnel)
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--neon-blue)', cursor: 'crosshair', touchAction: 'none' }}>
        <canvas 
          ref={canvasRef}
          width={400}
          height={150}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ width: '100%', display: 'block' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button onClick={clear} style={{ flex: 1, padding: '8px', background: 'rgba(255,50,50,0.1)', color: '#ff4444', border: '1px solid #ff4444', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Effacer</button>
        <button onClick={save} style={{ flex: 2, padding: '8px', background: 'var(--neon-blue)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>Pré-valider Signature</button>
      </div>
    </div>
  );
}

// Composant Chat Partagé (Version Client)
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

    let finalFile = imageContent;
    let fileType = imageContent && imageContent.startsWith('data:application/pdf') ? 'pdf' : 'image';
    
    if (imageContent && fileType === 'image') {
      finalFile = await compressImage(imageContent);
    }

    const msgObj = {
      sender: isAdmin ? 'admin' : 'client',
      text: newMessage,
      type: imageContent ? fileType : 'text',
      image: finalFile,
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
      left: isExpanded ? '50%' : 'auto',
      transform: isExpanded ? 'translateX(-50%)' : 'none',
      width: isExpanded ? 'min(92%, 800px)' : '100%',
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
                  <img src={msg.image} alt="Upload" style={{ maxWidth: '100%', borderRadius: '10px', cursor: 'pointer', display: 'block' }} onClick={() => openBase64File(msg.image)} />
                ) : msg.type === 'pdf' ? (
                  <div onClick={() => openBase64File(msg.image)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{fontSize: '1.5rem'}}>📄</span>
                    <div style={{fontSize: '0.8rem', textDecoration: 'underline'}}>Ouvrir le Devis/Facture PDF</div>
                  </div>
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
          accept="image/*,application/pdf" 
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
          title="Envoyer une photo ou un document"
        >
          📎
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
  const [signatureData, setSignatureData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

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

  useEffect(() => {
    fetchProject();
  }, [token]);

  const handleValidateQuote = async () => {
    if (!signatureData) {
      alert("Veuillez d'abord signer le devis dans la zone prévue.");
      return;
    }
    if (!window.confirm("Confirmez-vous la validation de ce devis ? (Valeur légale de 'Bon pour Accord')")) return;

    setIsValidating(true);
    try {
      const res = await fetch(`/api/suivi/${token}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: signatureData })
      });
      if (res.ok) {
        alert("✅ Devis validé avec succès !");
        fetchProject();
      } else {
        alert("Erreur lors de la validation.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

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

      {/* Section Devis */}
      {data.quote_amount > 0 && (data.status === 'Devis' || data.quote_status === 'validated') && (
        <div className="glass-panel mb-4" style={{ border: '1px solid var(--neon-blue)', background: 'rgba(0,229,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 className="neon-text" style={{ fontSize: '1.4rem', margin: 0 }}>💰 Devis du Projet</h2>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '10px 0', color: '#fff' }}>{data.quote_amount} € TTC</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {data.quote_status === 'validated' 
                  ? `✓ Accord donné par le client.` 
                  : "⌛ En attente de votre accord pour lancer la production."}
              </p>
            </div>
            
            {data.quote_status !== 'validated' ? (
              <div style={{ maxWidth: '420px', width: '100%' }}>
                <p style={{ fontSize: '0.85rem', marginBottom: '10px', color: 'var(--neon-blue)' }}>⬇️ Signez ci-dessous pour lancer le projet :</p>
                <SignaturePad onSave={setSignatureData} onClear={() => setSignatureData(null)} />
                <p style={{ fontSize: '0.75rem', color: 'var(--neon-blue)', marginTop: '8px', fontStyle: 'italic', textAlign: 'center' }}>
                  💡 Étape 1 : Signez au doigt ou à la souris. <br/>
                  💡 Étape 2 : Cliquez sur <strong>"Pré-valider"</strong> pour figer votre signature.
                </p>
                <button 
                  onClick={handleValidateQuote}
                  disabled={!signatureData || isValidating}
                  className="neon-button"
                  style={{ width: '100%', marginTop: '15px', padding: '12px', fontSize: '1rem', background: '#00ff66', color: '#000' }}
                >
                  {isValidating ? 'Validation...' : '🤝 BON POUR ACCORD (Valider)'}
                </button>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center' }}>
                  En cliquant, vous acceptez le devis. Votre signature, date, heure et IP seront enregistrées comme preuve légale.
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', background: 'rgba(0,255,100,0.1)', padding: '15px', borderRadius: '8px', border: '1px solid #00ff66', minWidth: '250px' }}>
                <p style={{ color: '#00ff66', fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>✓ Devis Validé</p>
                <img src={data.quote_signature} alt="Signature" style={{ maxHeight: '60px', marginTop: '10px', filter: 'invert(1)' }} />
                <div style={{ marginTop: '10px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', borderTop: '1px solid rgba(0,255,100,0.2)', paddingTop: '8px' }}>
                  💰 Montant validé : <strong>{data.quote_amount_validated} € TTC</strong><br/>
                  📅 Signé le : {new Date(data.quote_validated_at).toLocaleString('fr-FR')}<br/>
                  🌐 IP : {data.quote_ip}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* Visualisation 3D (Si disponible) */}
      {data.stl_data && (
        <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--neon-blue)', borderBottom: '1px solid rgba(0,229,255,0.1)', paddingBottom: '10px' }}>
            📦 Prototype 3D Interactif
          </h2>
          <STLViz stlData={data.stl_data} />
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Le prototype numérique est prêt. Vous pouvez manipuler la pièce pour l'observer sous tous les angles.
          </p>
        </div>
      )}

      {/* Chat Collaboratif avec Expert */}
      <div className="glass-panel" style={{ marginTop: '2rem' }}>
        <LeadChat 
          lead={data} 
          isAdmin={false} 
          onUpdate={(newMessages) => setData(prev => ({...prev, messages: newMessages}))} 
        />
        
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--neon-blue)', marginBottom: '10px', fontWeight: 'bold' }}>👤 Notes de l'Expert</label>
          <div style={{ 
            padding: '1.2rem', background: 'rgba(0,229,255,0.05)', borderRadius: '8px', 
            border: '1px solid var(--glass-border)', color: '#fff',
            fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: '1.5'
          }}>
            {data.admin_notes || "Aucune note partagée pour le moment."}
          </div>
        </div>
      </div>
    </main>
  );
}
