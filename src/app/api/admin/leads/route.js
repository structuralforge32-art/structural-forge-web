import { NextResponse } from 'next/server';
import { openDB } from '@/lib/db';
import { sendClientUpdate, sendNewMessageNotification } from '@/lib/mail';

export async function GET() {
  try {
    const db = await openDB();
    const leads = await db.all('SELECT * FROM leads ORDER BY unread_admin DESC, created_at DESC');
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Erreur API Admin:', error);
    return NextResponse.json({ error: 'Erreur Serveur Interne' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, status, admin_notes, client_notes, internal_notes, quote_amount, message, stl_data, clearMessages, markAsRead } = body;
    
    const leadId = Number(id);
    console.log('--- API ADMIN LEADS PUT START ---');
    console.log('Payload reçue:', { id, leadId, status, hasMessage: !!message });

    if (!id || isNaN(leadId)) {
      console.error('ID de lead invalide ou manquant:', id);
      return NextResponse.json({ error: 'ID de dossier invalide' }, { status: 400 });
    }

    const db = await openDB();
    console.log('Base de données ouverte avec succès.');

    // Check if lead exists
    const lead = await db.get('SELECT * FROM leads WHERE id = ?', [leadId]);
    if (!lead) {
      console.warn('Dossier non trouvé pour ID:', leadId);
      return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 });
    }
    console.log('Dossier trouvé:', lead.name);

    // Prepare update fields
    let updateFields = [];
    let params = [];

    // Marquer comme lu
    if (markAsRead) {
      updateFields.push('unread_admin = 0');
    }

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
    if (internal_notes !== undefined) {
      updateFields.push('internal_notes = ?');
      params.push(internal_notes);
    }
    if (quote_amount !== undefined) {
      updateFields.push('quote_amount = ?');
      params.push(parseFloat(quote_amount) || 0);
    }
    if (client_notes !== undefined) {
      updateFields.push('client_notes = ?');
      params.push(client_notes);
    }
    if (stl_data !== undefined) {
      updateFields.push('stl_data = ?');
      params.push(stl_data);
    }

    // Gestion du Chat (messages)
    let messages = [];
    try {
      if (lead.messages) messages = JSON.parse(lead.messages);
    } catch(e) {}

    if (clearMessages) {
      messages = [];
      updateFields.push('messages = ?');
      params.push(JSON.stringify(messages));
    } else if (message) {
      messages.push({
        ...message,
        timestamp: new Date().toISOString()
      });
      updateFields.push('messages = ?');
      params.push(JSON.stringify(messages));

      // Notification Email au client
      try {
        await sendNewMessageNotification(lead, 'admin');
      } catch (err) {
        console.error("Erreur notification message expert:", err);
      }
    }

    if (updateFields.length > 0) {
      params.push(leadId);
      console.log('Exécution de l\'UPDATE:', { updateFields, params });
      await db.run(`UPDATE leads SET ${updateFields.join(', ')} WHERE id = ?`, params);
    }

    console.log('--- API ADMIN LEADS PUT SUCCESS ---');
    return NextResponse.json({ success: true, messages });
    
  } catch (error) {
    console.error('--- API ADMIN LEADS PUT CRITICAL ERROR ---');
    console.error(error);
    return NextResponse.json({ error: 'Erreur Serveur Interne', details: error.message }, { status: 500 });
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
