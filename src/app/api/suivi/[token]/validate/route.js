import { NextResponse } from 'next/server';
import { openDB } from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const { token } = await params;
    const { signature } = await req.json();

    if (!token || !signature) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const db = await openDB();
    const lead = await db.get('SELECT id, history, status FROM leads WHERE token = ?', [token]);
    
    if (!lead) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = new Date().toISOString();

    // Mise à jour de l'historique (Timeline)
    let history = {};
    try {
      history = JSON.parse(lead.history || '{}');
    } catch(e) {}
    
    const statusText = "Devis validé";
    history[statusText] = now;

    await db.run(
      `UPDATE leads SET 
        quote_status = 'validated', 
        quote_validated_at = ?, 
        quote_ip = ?, 
        quote_signature = ?, 
        status = ?,
        history = ?
      WHERE id = ?`,
      [now, ip, signature, statusText, JSON.stringify(history), lead.id]
    );

    return NextResponse.json({ success: true, validated_at: now });
  } catch (error) {
    console.error('Erreur Validation Devis:', error);
    return NextResponse.json({ error: 'Erreur Serveur Interne' }, { status: 500 });
  }
}
