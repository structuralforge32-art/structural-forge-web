import { NextResponse } from 'next/server';
import { openDB } from '@/lib/db';
import { sendAdminNotification } from '@/lib/mail';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, type, message } = body;

    if (!name || !email || !type || !message) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const db = await openDB();
    const crypto = require('crypto');
    const projectToken = 'SF-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const initialHistory = JSON.stringify({ 
      'Création du projet': new Date().toISOString() 
    });

    const result = await db.run(
      'INSERT INTO leads (name, email, phone, type, message, status, token, history) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone || '', type, message, 'Création du projet', projectToken, initialHistory]
    );

    try {
      await sendAdminNotification({ name, email, phone, type, message, id: result.lastID });
      const { sendAdminSMS } = require('@/lib/sms');
      await sendAdminSMS({ name, type });
      const { sendClientConfirmation } = require('@/lib/mail');
      await sendClientConfirmation({ name, email, type, token: projectToken });
    } catch (err) {
      console.error("Erreur notifications (Email/SMS) :", err);
    }

    return NextResponse.json({ success: true, id: result.lastID });
    
  } catch (error) {
    console.error('Erreur API Contact (Détails):', error);
    // On renvoie un message plus explicite pour aider l'utilisateur à comprendre le problème de config
    const errorMessage = error.message.includes('Postgres') ? 'Erreur de connexion à la base de données' : 'Erreur Serveur Interne';
    return NextResponse.json({ error: errorMessage, details: error.message }, { status: 500 });
  }
}
