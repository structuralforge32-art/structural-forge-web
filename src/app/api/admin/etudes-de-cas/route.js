import { NextResponse } from 'next/server';
import { openDB } from '@/lib/db';

export async function GET() {
  try {
    const db = await openDB();
    const etudes = await db.all('SELECT * FROM etudes_de_cas ORDER BY created_at DESC');
    return NextResponse.json(etudes);
  } catch (error) {
    console.error('Erreur API Etudes GET:', error);
    return NextResponse.json({ error: 'Erreur Serveur' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') || '';
    let slug = formData.get('slug') || '';
    const problem_text = formData.get('problem_text') || '';
    const engineering_text = formData.get('engineering_text') || '';
    const result_text = formData.get('result_text') || '';
    const file = formData.get('file');

    if (!title) {
      return NextResponse.json({ error: 'Le titre est obligatoire' }, { status: 400 });
    }

    if (!slug) {
      // Generate slug from title if not provided
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    let dataUrl = null;
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Content = buffer.toString('base64');
      const mimeType = file.type || 'image/jpeg';
      dataUrl = `data:${mimeType};base64,${base64Content}`;
    }

    const db = await openDB();
    await db.run(
      'INSERT INTO etudes_de_cas (title, slug, image_url, problem_text, engineering_text, result_text) VALUES (?, ?, ?, ?, ?, ?)',
      [title, slug, dataUrl, problem_text, engineering_text, result_text]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API Etudes POST:', error);
    return NextResponse.json({ error: 'Erreur d\'ajout', details: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const formData = await req.formData();
    const id = formData.get('id');
    const title = formData.get('title') || '';
    let slug = formData.get('slug') || '';
    const problem_text = formData.get('problem_text') || '';
    const engineering_text = formData.get('engineering_text') || '';
    const result_text = formData.get('result_text') || '';
    const file = formData.get('file');

    if (!id || !title) {
      return NextResponse.json({ error: 'ID et Titre obligatoires' }, { status: 400 });
    }

    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const db = await openDB();
    
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Content = buffer.toString('base64');
      const mimeType = file.type || 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${base64Content}`;
      
      await db.run(
        'UPDATE etudes_de_cas SET title=?, slug=?, image_url=?, problem_text=?, engineering_text=?, result_text=? WHERE id=?',
        [title, slug, dataUrl, problem_text, engineering_text, result_text, id]
      );
    } else {
      // Don't update image if not provided
      await db.run(
        'UPDATE etudes_de_cas SET title=?, slug=?, problem_text=?, engineering_text=?, result_text=? WHERE id=?',
        [title, slug, problem_text, engineering_text, result_text, id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API Etudes PUT:', error);
    return NextResponse.json({ error: 'Erreur de mise à jour', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

    const db = await openDB();
    await db.run('DELETE FROM etudes_de_cas WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API Etudes DELETE:', error);
    return NextResponse.json({ error: 'Erreur Serveur' }, { status: 500 });
  }
}
