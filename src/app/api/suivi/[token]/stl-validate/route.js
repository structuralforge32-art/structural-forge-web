import { NextResponse } from 'next/server';
import { openDB } from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const { token } = await params;
    const { status, message } = await req.json();

    if (!token || !status) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const db = await openDB();
    const lead = await db.get('SELECT id, history, status FROM leads WHERE token = ?', [token]);
    
    if (!lead) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
    }

    const now = new Date().toISOString();

    // Mise à jour de l'historique (Timeline)
    let history = {};
    try {
      history = JSON.parse(lead.history || '{}');
    } catch(e) {}
    
    const statusText = status === 'validated' ? "Prototype 3D validé" : "Modifications 3D demandées";
    history[statusText] = now;

    // Si un message est fourni, on l'ajoute aux messages du chat
    if (message) {
      let messages = [];
      try {
        const leadMessages = await db.get('SELECT messages FROM leads WHERE id = ?', [lead.id]);
        messages = JSON.parse(leadMessages.messages || '[]');
      } catch(e) {}

      messages.push({
        sender: 'client',
        text: `[Validation 3D] ${status === 'validated' ? '✅ Validé' : '❌ Modifications demandées'} : ${message}`,
        type: 'text',
        timestamp: now
      });

      await db.run(
        `UPDATE leads SET 
          stl_status = ?, 
          history = ?,
          messages = ?,
          unread_admin = 1
        WHERE id = ?`,
        [status, JSON.stringify(history), JSON.stringify(messages), lead.id]
      );
    } else {
      await db.run(
        `UPDATE leads SET 
          stl_status = ?, 
          history = ?
        WHERE id = ?`,
        [status, JSON.stringify(history), lead.id]
      );
    }

    return NextResponse.json({ success: true, stl_status: status });
  } catch (error) {
    console.error('Erreur Validation STL:', error);
    return NextResponse.json({ error: 'Erreur Serveur Interne' }, { status: 500 });
  }
}
