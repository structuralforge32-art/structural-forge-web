'use client';
import { useState, useEffect } from 'react';

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
                <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', verticalAlign: 'top' }}>
                    {new Date(lead.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', verticalAlign: 'top' }}>{lead.name}</td>
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
                      onMouseOver={(e) => Object.assign(e.target.style, { background: 'rgba(255, 50, 50, 0.2)' })}
                      onMouseOut={(e) => Object.assign(e.target.style, { background: 'rgba(255, 50, 50, 0.1)' })}
                    >
                      🗑️ Supprimer
                    </button>
                  </td>
                </tr>
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
