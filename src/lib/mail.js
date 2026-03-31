import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'structural.forge32@gmail.com',
    pass: process.env.EMAIL_PASSWORD // To set up by user
  }
});

export async function sendAdminNotification(lead) {
  const mailOptions = {
    from: 'structural.forge32@gmail.com',
    to: 'structural.forge32@gmail.com',
    subject: `Nouveau Lead: ${lead.name} - ${lead.type}`,
    text: `
Nouveau lead reçu sur le site !

Nom: ${lead.name}
Email: ${lead.email}
Téléphone: ${lead.phone}
Besoin: ${lead.type}

Message:
${lead.message}

Connectez-vous à l'espace admin pour consulter et traiter cette demande.
    `
  };
  
  return transporter.sendMail(mailOptions);
}

export async function sendClientUpdate(lead) {
  const mailOptions = {
    from: 'structural.forge32@gmail.com',
    to: lead.email,
    subject: `Mise à jour de votre demande - Structural Forge`,
    text: `
Bonjour ${lead.name},

Le statut de votre demande concernant "${lead.type}" a été mis à jour par notre équipe. 
Nouveau statut : ${lead.status}

Suivez l'avancée de votre projet en temps réel sur votre portail sécurisé :
${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/suivi/${lead.token}

Nous travaillons avec précision sur votre projet et restons à votre disposition.

Cordialement,
L'équipe Structural Forge.
    `
  };
  
  return transporter.sendMail(mailOptions);
}
