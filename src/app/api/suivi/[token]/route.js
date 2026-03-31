import { NextResponse } from 'next/server';
import { openDB } from '@/lib/db';

export async function GET(req, { params }) {
  try {
    const { token } = await params;
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
    }

    const db = await openDB();
    
    // Rechercher le lead en sélectionnant uniquement les colonnes publiques
    const lead = await db.get('SELECT id, token, name, type, message, status, history, admin_notes, client_notes, messages, quote_amount, quote_amount_validated, quote_status, quote_validated_at, quote_signature, stl_data, created_at FROM leads WHERE token = ?', [token]);
    
    if (!lead) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, lead });
    
  } catch (error) {
    console.error('Erreur API Suivi:', error);
    return NextResponse.json({ error: 'Erreur Serveur Interne' }, { status: 500 });
  }
}
