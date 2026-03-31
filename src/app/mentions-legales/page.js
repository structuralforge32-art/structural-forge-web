export const metadata = {
  title: 'Mentions Légales | Structural Forge',
  description: 'Mentions légales liées à l\'activité de Structural Forge.',
};

export default function MentionsLegales() {
  return (
    <main className="section-container" style={{ paddingTop: '8rem', minHeight: '100vh', maxWidth: '800px', margin: '0 auto', color: 'var(--text-secondary)' }}>
      <div className="glass-panel" style={{ padding: '3rem' }}>
        <h1 className="neon-text" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Mentions Légales</h1>
        
        <h2 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>1. Éditeur du site</h2>
        <p>Le site internet "Structural Forge" est édité par :</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '1rem', lineHeight: '1.6' }}>
          <li><strong>Nom / Raison Sociale :</strong> Structural Forge (À REMPLACER)</li>
          <li><strong>Forme Juridique :</strong> Auto-entreprise / Micro-entreprise (À REMPLACER)</li>
          <li><strong>Adresse :</strong> [Votre Adresse Postale]</li>
          <li><strong>Téléphone :</strong> [Votre Numéro]</li>
          <li><strong>Email :</strong> structural.forge32@gmail.com</li>
          <li><strong>Numéro SIRET :</strong> [Votre SIRET]</li>
          <li><strong>Numéro TVA :</strong> Non assujetti à la TVA selon l'article 293 B du CGI (ou numéro TVA si applicable).</li>
        </ul>

        <h2 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>2. Hébergement</h2>
        <p>Le site est hébergé par :</p>
        <p>
          [Exemple : Vercel Inc.]<br/>
          [440 N Barranca Ave #4133 Covina, CA 91723]<br/>
          [privacy@vercel.com]
        </p>

        <h2 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>3. Propriété Intellectuelle</h2>
        <p style={{ lineHeight: '1.6' }}>
          L’ensemble de ce site relève de la législation française et internationale sur le droit d’auteur et la propriété intellectuelle.
          Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques, 
          photographiques et les créations 3D.
        </p>

        <h2 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>4. Données Personnelles & Cookies</h2>
        <p style={{ lineHeight: '1.6' }}>
          Les données personnelles collectées via le formulaire de contact (nom, email, téléphone) sont utilisées uniquement 
          pour le traitement de votre demande de devis et la gestion de votre projet avec Structural Forge. Ces données ne sont 
          jamais partagées avec des tiers à des fins commerciales. <br/><br/>
          Vous disposez d'un droit d'accès, de rectification et de suppression de vos données en nous contactant directement par email.
        </p>
      </div>
    </main>
  );
}
