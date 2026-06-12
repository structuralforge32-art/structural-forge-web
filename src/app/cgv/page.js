export const metadata = {
  title: 'Conditions Générales de Vente | Structural Forge',
  description: 'Conditions générales de vente pour la conception et l\'impression 3D sur-mesure.',
};

export default function CGV() {
  return (
    <main className="section-container" style={{ paddingTop: '8rem', minHeight: '100vh', maxWidth: '800px', margin: '0 auto', color: 'var(--text-secondary)' }}>
      <div className="glass-panel" style={{ padding: '3rem' }}>
        <h1 className="neon-text" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Conditions Générales de Vente (CGV)</h1>
        
        <p style={{ fontStyle: 'italic', marginBottom: '2rem' }}>Dernière mise à jour : Juin 2026</p>

        <h2 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>1. Objet</h2>
        <p style={{ lineHeight: '1.6' }}>
          Les présentes CGV régissent la vente de pièces issues de l’impression 3D et les prestations 
          de réparation effectuées par Thomas LABORDE (E.I.), sous l'enseigne "STRUCTURAL FORGE”.
        </p>

        <h2 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>2. Devis et Commandes</h2>
        <p style={{ lineHeight: '1.6' }}>
          Toute prestation fait l'objet d'un devis préalable. La commande est validée dès l'acceptation 
          écrite du devis par le client. Pour les réparations, le client accepte que l'intervention puisse 
          révéler des dommages invisibles lors de l'examen initial.
        </p>

        <h2 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>3. Tarifs et Paiement</h2>
        <p style={{ lineHeight: '1.6' }}>
          Les prix sont indiqués en Euros nets (TVA non applicable, art. 293 B du CGI). Le paiement 
          est dû à réception de la facture, sauf accord particulier. En cas de retard de paiement, des 
          pénalités au taux de 10% annuel sont exigibles.
        </p>

        <h2 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>4. Responsabilité et Garantie (Spécial Réparation/3D)</h2>
        <p style={{ lineHeight: '1.6' }}>
          <strong>Impression 3D :</strong> Les pièces sont fabriquées selon les spécifications convenues. L'utilisation 
          de la pièce (résistance mécanique, exposition chaleur/UV) relève de la responsabilité du client.<br/><br/>
          <strong>Réparation :</strong> "STRUCTURAL FORGE" s'engage à une obligation de moyens. Si une pièce 
          imprimée pour réparation casse suite à une mauvaise utilisation ou une contrainte excessive 
          non prévue, la responsabilité de l'entreprise ne pourra être engagée.<br/><br/>
          <strong>Exclusion :</strong> Aucune garantie ne s'applique en cas de modification de la pièce par le client ou 
          d'usage anormal de l'objet réparé.
        </p>

        <h2 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>5. Propriété Intellectuelle</h2>
        <p style={{ lineHeight: '1.6' }}>
          Sauf accord écrit, les fichiers de modélisation 3D créés par "structural forge" restent sa 
          propriété exclusive. Le client ne paye que pour la fabrication de l'objet physique.
        </p>

        <h2 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>6. Droit de rétractation</h2>
        <p style={{ lineHeight: '1.6' }}>
          Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne 
          s'applique pas aux produits confectionnés selon les spécifications du consommateur (pièces 
          personnalisées ou sur-mesure).
        </p>

        <h2 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>7. Litiges</h2>
        <p style={{ lineHeight: '1.6' }}>
          En cas de litige, une solution amiable sera privilégiée avant toute action devant le tribunal de 
          commerce compétent (Auch).
        </p>
      </div>
    </main>
  );
}
