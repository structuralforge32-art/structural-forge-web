/**
 * Service de notification SMS (Exemple Twilio / Vonage)
 * Pour activer, configurez les variables d'environnement SMS_ACCOUNT_SID, SMS_AUTH_TOKEN, SMS_FROM et SMS_TO.
 */
export async function sendAdminSMS(leadData) {
  const { name, type } = leadData;
  const message = `Structural Forge : Nouvelle demande de ${name} pour "${type}". Connectez-vous au dashboard admin.`;

  console.log("📨 Simulation SMS Envoyée :", message);

  // Configuration (Optionnel si vous avez un compte Twilio)
  const sid = process.env.SMS_ACCOUNT_SID;
  const token = process.env.SMS_AUTH_TOKEN;
  const from = process.env.SMS_FROM;
  const to = process.env.SMS_TO || process.env.ADMIN_PHONE;

  if (!sid || !token || !from || !to) {
    console.warn("⚠️ SMS non configuré : Configurez vos variables d'environnement pour l'envoi réel.");
    return false;
  }

  try {
    // Exemple d'appel Twilio
    const basicAuth = Buffer.from(`${sid}:${token}`).toString('base64');
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: from,
        To: to,
        Body: message
      })
    });

    if (res.ok) {
      console.log("✅ SMS envoyé avec succès via Twilio.");
      return true;
    } else {
      const error = await res.json();
      console.error("❌ Échec de l'envoi SMS Twilio :", error);
      return false;
    }
  } catch (err) {
    console.error("❌ Erreur service SMS :", err);
    return false;
  }
}
