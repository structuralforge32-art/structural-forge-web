'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: "Pièces pour l'automobile",
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', type: "Pièces pour l'automobile", message: '' });
      } else {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (status === 'success') {
    return (
      <div className="glass-panel text-center">
        <h3 className="neon-text mb-4" style={{fontSize: '2rem'}}>Demande Envoyée ! 🙌</h3>
        <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6'}}>
          Merci pour votre message. Nous l'avons bien reçu ! 🛒🔧
        </p>
        <p style={{color: 'var(--neon-blue)', marginBottom: '2rem', fontWeight: 'bold', border: '1px dashed var(--neon-blue)', padding: '15px', borderRadius: '8px', background: 'rgba(0,229,255,0.05)'}}>
          📧 Consultez vos emails : un <strong>lien de suivi sécurisé</strong> vient de vous être envoyé pour suivre l'avancée de votre projet et <strong>chatter en direct</strong> avec notre technicien.
        </p>
        <button onClick={() => setStatus('idle')} className="neon-button">Nouvelle Demande</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel">
      <h3 className="neon-text mb-4 text-center" style={{fontSize: '1.8rem'}}>Décrivez votre besoin</h3>
      
      {status === 'error' && (
        <div style={{background: 'rgba(255, 0, 0, 0.1)', color: '#ff4444', padding: '10px', borderRadius: '5px', marginBottom: '1rem', border: '1px solid #ff4444'}}>
          {errorMessage}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Nom Complet *</label>
        <input required type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="John Doe" />
      </div>

      <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
        <div className="form-group" style={{flex: '1 1 200px'}}>
          <label className="form-label">Email *</label>
          <input required type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="john@example.com" />
        </div>
        <div className="form-group" style={{flex: '1 1 200px'}}>
          <label className="form-label">Téléphone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="06 12 34 56 78" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Type de Projet *</label>
        <select required name="type" value={formData.type} onChange={handleChange} className="form-input" style={{appearance: 'none', cursor: 'pointer'}}>
          <option value="Pièces pour l'automobile">Pièces pour l'automobile</option>
          <option value="Outillages / consommable">Outillages / consommable</option>
          <option value="Autre">Autre</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Description détaillée *</label>
        <textarea required name="message" value={formData.message} onChange={handleChange} className="form-input form-textarea" placeholder="Décrivez la pièce, les dimensions, la matière souhaitée..."></textarea>
      </div>

      <button disabled={status === 'loading'} type="submit" className="neon-button" style={{width: '100%', marginTop: '1rem'}}>
        {status === 'loading' ? 'Envoi en cours...' : 'Envoyer la demande'}
      </button>
    </form>
  );
}
