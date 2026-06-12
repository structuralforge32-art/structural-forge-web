import { NextResponse } from 'next/server';
import { openDB } from '@/lib/db';

export async function GET() {
  try {
    const db = await openDB();
    const parts = await db.all('SELECT * FROM parts ORDER BY created_at DESC');
    return NextResponse.json(parts);
  } catch (error) {
    console.error('Erreur API Parts GET:', error);
    return NextResponse.json({ error: 'Erreur Serveur' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { reference, name, price, stock } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Le nom de la pièce est requis' }, { status: 400 });
    }

    const db = await openDB();
    await db.run(
      'INSERT INTO parts (reference, name, price, stock) VALUES (?, ?, ?, ?)',
      [reference || '', name, parseFloat(price) || 0, parseInt(stock) || 0]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API Parts POST:', error);
    return NextResponse.json({ error: 'Erreur lors du rajout de la pièce', details: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { id, reference, name, price, stock, action } = await req.json();

    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

    const db = await openDB();

    if (action === 'sold') {
      // Decrement stock by 1
      await db.run('UPDATE parts SET stock = MAX(0, stock - 1) WHERE id = ?', [id]);
    } else {
      // General update
      const updateFields = [];
      const params = [];

      if (reference !== undefined) { updateFields.push('reference = ?'); params.push(reference); }
      if (name !== undefined) { updateFields.push('name = ?'); params.push(name); }
      if (price !== undefined) { updateFields.push('price = ?'); params.push(parseFloat(price)); }
      if (stock !== undefined) { updateFields.push('stock = ?'); params.push(parseInt(stock)); }

      if (updateFields.length > 0) {
        params.push(id);
        await db.run(`UPDATE parts SET ${updateFields.join(', ')} WHERE id = ?`, params);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API Parts PUT:', error);
    return NextResponse.json({ error: 'Erreur de mise à jour' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

    const db = await openDB();
    await db.run('DELETE FROM parts WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API Parts DELETE:', error);
    return NextResponse.json({ error: 'Erreur Serveur' }, { status: 500 });
  }
}
