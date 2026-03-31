import { NextResponse } from 'next/server';
import { openDB } from '@/lib/db';
import { sendNewMessageNotification } from '@/lib/mail';

export async function POST(req, { params }) {
  try {
    const { token } = await params;
    const body = await req.json();
    const { client_notes } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
    }

    const db = await openDB();
    
    // Rechercher le lead via le token
    const lead = await db.get('SELECT * FROM leads WHERE token = ?', [token]);
    if (!lead) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
    }

    // Mettre à jour les notes ET ajouter au flux de messages (Chat)
    const currentLead = await db.get('SELECT messages, client_notes FROM leads WHERE id = ?', [lead.id]);
    let messages = [];
    try {
      if (currentLead.messages) messages = JSON.parse(currentLead.messages);
    } catch(e) {}

    // Si on reçoit un nouveau message structuré
    if (body.message) {
      messages.push({
        ...body.message,
        timestamp: new Date().toISOString()
      });
      
      // Notification Email à l'admin + Point rouge
      await db.run(
        'UPDATE leads SET client_notes = ?, messages = ?, unread_admin = 1 WHERE id = ?', 
        [client_notes !== undefined ? client_notes : (currentLead.client_notes || ''), JSON.stringify(messages), lead.id]
      );

      try {
        await sendNewMessageNotification(lead, 'client');
      } catch (err) {
        console.error("Erreur notification message client:", err);
      }
    } else {
      await db.run(
        'UPDATE leads SET client_notes = ?, messages = ? WHERE id = ?', 
        [client_notes !== undefined ? client_notes : (currentLead.client_notes || ''), JSON.stringify(messages), lead.id]
      );
    }

    return NextResponse.json({ success: true, messages });
    
  } catch (error) {
    console.error('Erreur API Notes Client:', error);
    return NextResponse.json({ error: 'Erreur Serveur Interne' }, { status: 500 });
  }
}
