'use client';
import React, { useState, useEffect, useRef } from 'react';

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
};// Composant Chat Partagé
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

  // Marquer comme lu pour l'admin à l'ouverture
  useEffect(() => {
    if (isAdmin && lead.unread_admin) {
      fetch('/api/admin/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, markAsRead: true })
      }).catch(err => console.error(err));
    }
  }, [isAdmin, lead.unread_admin, lead.id]);

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

  const clearHistory = async () => {
    if (!isAdmin || !window.confirm("Effacer tout l'historique de discussion ?")) return;
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, clearMessages: true })
      });
      const result = await res.json();
      if (res.ok) {
        setMessages(result.messages);
        if (onUpdate) onUpdate(result.messages);
      }
    } catch (e) { console.error(e); }
  };

  const chatHeight = isExpanded ? 'calc(100vh - 200px)' : '550px';

  return (
    <div className="chat-container" style={{ 
      display: 'flex', flexDirection: 'column', height: chatHeight, 
      background: 'rgba(0,0,0,0.5)', borderRadius: '12px', 
      border: '1px solid var(--glass-border)', overflow: 'hidden', 
      transition: 'height 0.4s ease',
      boxShadow: isExpanded ? '0 0 50px rgba(0,0,0,0.5)' : 'none',
      position: isExpanded ? 'fixed' : 'relative',
      top: isExpanded ? '100px' : 'auto',
      left: isExpanded ? '5%' : 'auto',
      width: isExpanded ? '90%' : '100%',
      zIndex: isExpanded ? 1000 : 1
    }}>
      <div className="chat-header" style={{ padding: '12px 15px', background: 'rgba(255,255,255,0.08)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--neon-blue)' }}>🤝 Échanges Projet</span>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid var(--neon-blue)', color: 'var(--neon-blue)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
          >
            {isExpanded ? '⤫ Réduire' : '⤢ Agrandir'}
          </button>
        </div>
        {isAdmin && (
          <button onClick={clearHistory} style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: '0.7rem', cursor: 'pointer' }}>🗑 Effacer historique</button>
        )}
      </div>

      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '30px' }}>
            Aucun message.
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = (isAdmin && msg.sender === 'admin') || (!isAdmin && msg.sender === 'client');
          return (
            <div key={i} style={{ 
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              maxWidth: isExpanded ? '70%' : '90%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMe ? 'flex-end' : 'flex-start'
            }}>
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: isMe ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                background: isMe ? 'var(--neon-blue)' : 'rgba(255,255,255,0.12)',
                color: isMe ? '#000' : '#fff',
                fontSize: '0.95rem',
                boxShadow: isMe ? '0 0 15px rgba(0,229,255,0.2)' : 'none'
              }}>
                {msg.type === 'image' ? (
                  <img src={msg.image} alt="Upload" style={{ maxWidth: '100%', borderRadius: '10px', cursor: 'pointer', display: 'block' }} onClick={() => window.open(msg.image)} />
                ) : (
                  msg.text
                )}
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '5px', padding: '0 5px' }}>
                {msg.sender === 'admin' ? 'Expert' : 'Client'} • {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input" style={{ 
        padding: '15px', 
        background: 'rgba(255,255,255,0.08)', 
        borderTop: '1px solid var(--glass-border)', 
        display: 'flex', 
        gap: '10px',
        alignItems: 'center'
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
            background: 'var(--neon-blue)', color: '#000', border: 'none', borderRadius: '50%', 
            width: '42px', height: '42px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem',
            flexShrink: 0,
            opacity: isSending || !newMessage.trim() ? 0.5 : 1
          }}
        >
          {isSending ? '...' : '➤'}
        </button>
      </div>
    </div>
  );
}

function LeadRow({ lead, updateStatus, deleteLead }) {
  const [adminNotes, setAdminNotes] = useState(lead.admin_notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState(lead.messages || '[]');

  const saveNotes = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, admin_notes: adminNotes })
      });
      if (res.ok) {
        alert('Notes sauvegardées !');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <tr style={{ borderBottom: isExpanded ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
        <td style={{ padding: '1rem', color: 'var(--text-secondary)', verticalAlign: 'top' }}>
          {new Date(lead.created_at).toLocaleDateString('fr-FR')}
        </td>
        <td style={{ padding: '1rem', fontWeight: 'bold', verticalAlign: 'top' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {lead.name}
            {lead.unread_admin === 1 && (
              <span style={{ width: '8px', height: '8px', background: '#ff4444', borderRadius: '50%', boxShadow: '0 0 8px #ff4444' }} title="Nouveau message"></span>
            )}
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ 
              display: 'block', marginTop: '5px', fontSize: '0.7rem', color: 'var(--neon-blue)', 
              background: 'none', border: 'none', cursor: 'pointer', padding: 0 
            }}
          >
            {isExpanded ? '▲ Cacher Discussion' : '▼ Voir Discussion'}
          </button>
        </td>
        <td style={{ padding: '1rem', verticalAlign: 'top', minWidth: '150px' }}>
          <a href={`mailto:${lead.email}`} style={{ color: 'var(--neon-blue)', textDecoration: 'none' }}>{lead.email}</a><br/>
          <small style={{color: 'var(--text-secondary)'}}>{lead.phone}</small>
        </td>
        <td style={{ padding: '1rem', maxWidth: '300px', verticalAlign: 'top' }}>
          <strong style={{display: 'block', marginBottom: '0.5rem', color: '#fff'}}>{lead.type}</strong>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {lead.message}
          </div>
        </td>
        <td style={{ padding: '1rem', verticalAlign: 'top' }}>
          <span style={{ 
            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap',
            background: lead.status === 'Création du projet' ? 'rgba(0,229,255,0.2)' 
                      : lead.status === 'Terminé' ? 'rgba(0,255,100,0.2)'
                      : 'rgba(255, 200, 0, 0.2)',
            color: lead.status === 'Création du projet' ? 'var(--neon-blue)' 
                 : lead.status === 'Terminé' ? '#00ff66'
                 : '#ffc800'
          }}>
            {lead.status}
          </span>
          {lead.token && (
            <div style={{marginTop: '10px'}}>
              <a href={`/suivi/${lead.token}`} target="_blank" rel="noopener noreferrer" style={{color: 'var(--neon-blue)', fontSize: '0.8rem', textDecoration: 'none'}}>📎 Portail Client</a>
            </div>
          )}
        </td>
        <td style={{ padding: '1rem', verticalAlign: 'top', display: 'flex', gap: '8px', flexDirection: 'column' }}>
          <select 
            onChange={(e) => updateStatus(lead.id, e.target.value)}
            value={lead.status}
            className="form-input"
            style={{ padding: '8px', fontSize: '0.85rem', background: '#0a0f1e' }}
          >
            <option value="Création du projet">Création du projet</option>
            <option value="Validation de faisabilité">Validation de faisabilité</option>
            <option value="Devis">Devis</option>
            <option value="Modélisation 3D">Modélisation 3D</option>
            <option value="Prototypage">Prototypage</option>
            <option value="Impression finale">Impression finale</option>
            <option value="Facturation">Facturation</option>
            <option value="Terminé">Terminé</option>
          </select>

          <button 
            onClick={() => deleteLead(lead.id)}
            style={{
              padding: '6px', background: 'rgba(255, 50, 50, 0.1)', color: '#ff4444', 
              border: '1px solid rgba(255, 50, 50, 0.3)', borderRadius: '4px', cursor: 'pointer',
              fontSize: '0.8rem', width: '100%', textAlign: 'center'
            }}
          >
            🗑️ Supprimer
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr style={{ background: 'rgba(10,20,40,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <td colSpan="6" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
              <div>
                <LeadChat lead={{...lead, messages}} isAdmin={true} onUpdate={(newM) => setMessages(JSON.stringify(newM))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--neon-blue)', marginBottom: '8px', fontWeight: 'bold' }}>📝 Notes Internes (Admin uniquement)</label>
                <textarea 
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="form-input"
                  style={{ minHeight: '344px', fontSize: '0.85rem', background: 'rgba(0,0,0,0.4)' }}
                  placeholder="Notes techniques, mémos privés..."
                />
                <button 
                  onClick={saveNotes}
                  disabled={isSaving}
                  className="neon-button"
                  style={{ marginTop: '10px', padding: '6px 12px', fontSize: '0.75rem', width: '100%' }}
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer Notes Internes'}
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [leads, setLeads] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' or 'gallery'
  
  // Gallery states
  const [uploadLoading, setUploadLoading] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Authentification simplifiée
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'FORGE2026') { // Mot de passe par défaut
      setIsAuthenticated(true);
      fetchLeads();
      fetchGallery();
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/leads');
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (id) => {
    try {
      const confirmAction = window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce projet ?");
      if (!confirmAction) return;
      
      const res = await fetch('/api/admin/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      if (res.ok) fetchLeads();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const confirmAction = window.confirm(`Passer ce lead au statut : ${newStatus} ? Un email direct sera envoyé au client pour le notifier.`);
      if (!confirmAction) return;
      
      const res = await fetch('/api/admin/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      
      if (res.ok) fetchLeads();
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/admin/gallery');
      const data = await res.json();
      setGallery(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const uploadImage = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('caption', newCaption);

      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setNewCaption('');
        setSelectedFile(null);
        // Reset file input
        e.target.reset();
        fetchGallery();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  const deleteImage = async (id) => {
    if (!window.confirm("Supprimer cette réalisation de la galerie ?")) return;

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'DELETE',
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchGallery();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="section-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={handleLogin} className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h2 className="neon-text mb-4">Portail Administrateur</h2>
          <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem'}}>Entrez le mot de passe pour gérer les devis.</p>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Mot de passe" 
            className="form-input mb-4"
          />
          <button type="submit" className="neon-button" style={{ width: '100%' }}>Se Connecter</button>
        </form>
      </main>
    );
  }

  return (
    <main className="section-container" style={{ minHeight: '100vh', paddingTop: '8rem', maxWidth: '100%' }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <div>
          <h2 className="neon-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🕹 Dashboard Admin</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Gérez vos demandes et notifiez automatiquement vos clients depuis cette interface.
          </p>
        </div>
        <button onClick={activeTab === 'leads' ? fetchLeads : fetchGallery} className="neon-button" style={{padding: '8px 16px', fontSize: '0.8rem'}}>Actualiser</button>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('leads')}
          style={{
            background: activeTab === 'leads' ? 'var(--neon-blue)' : 'transparent',
            color: activeTab === 'leads' ? '#000' : '#fff',
            border: activeTab === 'leads' ? '1px solid var(--neon-blue)' : '1px solid var(--glass-border)',
            padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', transition: '0.3s', fontWeight: 'bold'
          }}
        >
          📁 Demandes Client
        </button>
        <button 
          onClick={() => setActiveTab('gallery')}
          style={{
            background: activeTab === 'gallery' ? 'var(--neon-blue)' : 'transparent',
            color: activeTab === 'gallery' ? '#000' : '#fff',
            border: activeTab === 'gallery' ? '1px solid var(--neon-blue)' : '1px solid var(--glass-border)',
            padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', transition: '0.3s', fontWeight: 'bold'
          }}
        >
          🖼 Gestion Galerie
        </button>
      </div>

      {loading ? (
        <p className="text-center" style={{padding: '3rem', color: 'var(--text-secondary)'}}>Chargement en cours...</p>
      ) : activeTab === 'leads' ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse', background: 'rgba(10,15,30,0.6)', borderRadius: '12px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: 'var(--dark-glass)', textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Client</th>
                <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Contact</th>
                <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Type & Message</th>
                <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Statut Actuel</th>
                <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Action (Statut)</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Aucun projet en attente pour le moment.
                  </td>
                </tr>
              )}
              {leads.map(lead => (
                <LeadRow 
                  key={lead.id} 
                  lead={lead} 
                  updateStatus={updateStatus} 
                  deleteLead={deleteLead} 
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-panel">
          <h3 className="mb-4">Importer une nouvelle réalisation</h3>
          <form onSubmit={uploadImage} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '3rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Image de la pièce</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="form-input"
                required
              />
            </div>
            <div style={{ flex: 2, minWidth: '300px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>Légende (ex: Pièce moteur Turbo, Support ABS...)</label>
              <input 
                type="text" 
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="Décrivez la pièce..."
                className="form-input"
                required
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" disabled={uploadLoading} className="neon-button" style={{ height: '45px' }}>
                {uploadLoading ? 'Importation...' : '🚀 Ajouter à la Galerie'}
              </button>
            </div>
          </form>

          <h3 className="mb-4">Réalisations actuelles</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {gallery.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Aucune image. Commencez à importer vos créations !</p>}
            {gallery.map(img => (
              <div key={img.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)' }}>
                <img src={img.url} alt={img.caption} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                <div style={{ padding: '10px' }}>
                  <p style={{ fontSize: '0.8rem', color: '#fff', margin: '0 0 10px 0', height: '2.4em', overflow: 'hidden' }}>{img.caption}</p>
                  <button 
                    onClick={() => deleteImage(img.id)}
                    style={{ width: '100%', padding: '5px', background: 'rgba(255,0,0,0.1)', color: '#ff4444', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    🗑 Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
