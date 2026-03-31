import { NextResponse } from 'next/server';
import { openDB } from '@/lib/db';

export async function GET(req, { params }) {
  try {
    const { token } = await params;
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
    }

    const db = await openDB();
    
    // Rechercher le lead en utilisant le token secret
    const lead = await db.get('SELECT name, type, message, status, history, admin_notes, client_notes, created_at FROM leads WHERE token = ?', [token]);
    
    if (!lead) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, lead });
    
  } catch (error) {
    console.error('Erreur API Suivi:', error);
    return NextResponse.json({ error: 'Erreur Serveur Interne' }, { status: 500 });
  }
}
