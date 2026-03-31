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
    const { id, status, admin_notes, client_notes } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    const db = await openDB();
    
    // Check if lead exists
    const lead = await db.get('SELECT * FROM leads WHERE id = ?', [id]);
    if (!lead) {
      return NextResponse.json({ error: 'Lead introuvable' }, { status: 404 });
    }

    // Prepare update fields
    let updateFields = [];
    let params = [];

    if (status !== undefined) {
      // Update history if status changed
      let historyObj = {};
      try {
        if (lead.history) historyObj = JSON.parse(lead.history);
      } catch(e) {}
      
      if (status !== lead.status) {
        historyObj[status] = new Date().toISOString();
        updateFields.push('status = ?', 'history = ?');
        params.push(status, JSON.stringify(historyObj));
        
        // Send email notification for status change
        try {
          await sendClientUpdate({ ...lead, status });
        } catch (mailError) {
          console.error("Erreur d'email au client:", mailError);
        }
      }
    }

    if (admin_notes !== undefined) {
      updateFields.push('admin_notes = ?');
      params.push(admin_notes);
    }

    if (client_notes !== undefined) {
      updateFields.push('client_notes = ?');
      params.push(client_notes);
    }

    if (updateFields.length > 0) {
      params.push(id);
      await db.run(`UPDATE leads SET ${updateFields.join(', ')} WHERE id = ?`, params);
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
