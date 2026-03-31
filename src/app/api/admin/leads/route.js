import { NextResponse } from 'next/server';
import { openDB } from '@/lib/db';
import { sendClientUpdate } from '@/lib/mail';

export async function GET() {
  try {
    const db = await openDB();
    const leads = await db.all('SELECT * FROM leads ORDER BY created_at DESC');
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Erreur API Admin:', error);
    return NextResponse.json({ error: 'Erreur Serveur Interne' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const db = await openDB();
    
    // Check if lead exists
    const lead = await db.get('SELECT * FROM leads WHERE id = ?', [id]);
    if (!lead) {
      return NextResponse.json({ error: 'Lead introuvable' }, { status: 404 });
    }
    // Update the status and history
    let historyObj = {};
    try {
      if (lead.history) historyObj = JSON.parse(lead.history);
    } catch(e) {}
    
    // Add current timestamp for this new status if not already present
    historyObj[status] = new Date().toISOString();
    const newHistory = JSON.stringify(historyObj);

    await db.run('UPDATE leads SET status = ?, history = ? WHERE id = ?', [status, newHistory, id]);

    // Send the email update to the client
    try {
      if (status !== lead.status) {
        await sendClientUpdate({ ...lead, status });
      }
    } catch (mailError) {
      console.error("Erreur d'email au client:", mailError);
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Erreur API Admin Update:', error);
    return NextResponse.json({ error: 'Erreur Serveur Interne' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;
    
    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

    const db = await openDB();
    await db.run('DELETE FROM leads WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API Admin Delete:', error);
    return NextResponse.json({ error: 'Erreur Serveur Interne' }, { status: 500 });
  }
}
