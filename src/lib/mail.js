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
export async function sendNewMessageNotification(lead, senderType) {
  const isFromExpert = senderType === 'admin';
  const mailOptions = {
    from: 'structural.forge32@gmail.com',
    to: isFromExpert ? lead.email : 'structural.forge32@gmail.com',
    subject: isFromExpert 
      ? `👨‍🔧 Nouveau message de l'Expert - Projet ${lead.type}`
      : `💬 Nouveau message de ${lead.name} - Projet ${lead.type}`,
    text: isFromExpert
      ? `
Bonjour ${lead.name},

L'expert Structural Forge a laissé un nouveau message ou une nouvelle photo sur votre portail de suivi concernant le projet "${lead.type}".

Consultez le message et répondez ici :
${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/suivi/${lead.token}

Cordialement,
L'équipe Structural Forge.
      `
      : `
Bonjour,

Le client ${lead.name} a envoyé un nouveau message concernant son projet "${lead.type}".

Connectez-vous au dashboard admin pour lui répondre :
${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin

Détails du lead :
Nom: ${lead.name}
Projet: ${lead.type}
      `
  };
  
  return transporter.sendMail(mailOptions);
}

export async function sendClientConfirmation(lead) {
  const mailOptions = {
    from: 'structural.forge32@gmail.com',
    to: lead.email,
    subject: `Confirmation de votre demande - Structural Forge`,
    text: `Bonjour ${lead.name}, nous avons bien reçu votre demande concernant "${lead.type}". Suivez l'avancement ici : ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/suivi/${lead.token}`
  };
  return transporter.sendMail(mailOptions);
}
