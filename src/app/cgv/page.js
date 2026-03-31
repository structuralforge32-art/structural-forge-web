export const metadata = {
  title: 'Conditions Générales de Vente | Structural Forge',
  description: 'Conditions générales de vente pour la conception et l\'impression 3D sur-mesure.',
};

export default function CGV() {
  return (
    <main className="section-container" style={{ paddingTop: '8rem', minHeight: '100vh', maxWidth: '800px', margin: '0 auto', color: 'var(--text-secondary)' }}>
      <div className="glass-panel" style={{ padding: '3rem' }}>
        <h1 className="neon-text" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Conditions Générales de Vente (CGV)</h1>
        
        <p style={{ fontStyle: 'italic', marginBottom: '2rem' }}>Dernière mise à jour : Mars 2026</p>

        <h2 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>1. Objet</h2>
        <p style={{ lineHeight: '1.6' }}>
          Les présentes Conditions Générales de Vente déterminent les droits et obligations des parties dans le cadre de 
          la vente de prestations de modélisation 3D, de prototypage et d'impression 3D proposées par Structural Forge.
        </p>

        <h2 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>2. Devis et Commandes</h2>
        <p style={{ lineHeight: '1.6' }}>
          Toute commande fait l'objet d'un devis préalable gratuit et sans engagement. La commande n'est définitivement 
          validée qu'après acceptation du devis par le client et réception de l'acompte défini dans ledit devis.
        </p>

        <h2 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>3. Prix et Modalités de Paiement</h2>
        <p style={{ lineHeight: '1.6' }}>
          Les prix de nos produits sont indiqués en euros hors taxes (TVA non applicable, art. 293 B du CGI - À MODIFIER SI CHANGEMENT). 
          Le règlement s'effectue selon les conditions précisées sur le devis (virement bancaire, chèque, espèces).
        </p>

        <h2 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>4. Droit de Rétractation (Sur-mesure)</h2>
        <p style={{ lineHeight: '1.6' }}>
          Conformément à l’article L221-28 du Code de la consommation, <strong>le droit de rétractation ne peut être exercé</strong> pour les contrats 
          de fourniture de biens confectionnés selon les spécifications du consommateur ou nettement personnalisés. 
          Ainsi, dès la validation de faisabilité et le lancement de la modélisation/production, aucune annulation pure et simple 
          ne pourra donner lieu au remboursement de l'acompte.
        </p>

        <h2 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>5. Livraison et Délais</h2>
        <p style={{ lineHeight: '1.6' }}>
          L'impression et la modélisation 3D étant des processus itératifs, les délais sont donnés à titre indicatif sur le devis. 
          Les risques liés à l'expédition sont à la charge du client dès lors que la pièce quitte nos ateliers.
        </p>
      </div>
    </main>
  );
}
