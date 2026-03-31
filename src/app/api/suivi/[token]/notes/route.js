import { NextResponse } from 'next/server';
import { openDB } from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const { token } = await params;
    const body = await req.json();
    const { client_notes } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
    }

    const db = await openDB();
    
    // Vérifier si le projet existe via le token
    const lead = await db.get('SELECT id FROM leads WHERE token = ?', [token]);
    if (!lead) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
    }

    // Mettre à jour uniquement les notes du client
    await db.run('UPDATE leads SET client_notes = ? WHERE id = ?', [client_notes || '', lead.id]);

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Erreur API Notes Client:', error);
    return NextResponse.json({ error: 'Erreur Serveur Interne' }, { status: 500 });
  }
}
