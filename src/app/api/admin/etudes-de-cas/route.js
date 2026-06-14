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
    const problem_file = formData.get('problem_file');
    const engineering_file = formData.get('engineering_file');
    const result_file = formData.get('result_file');

    if (!title) {
      return NextResponse.json({ error: 'Le titre est obligatoire' }, { status: 400 });
    }

    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const processFile = async (f) => {
      if (f && f.size > 0) {
        const arrayBuffer = await f.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return `data:${f.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
      }
      return null;
    };

    const dataUrl = await processFile(file);
    const problemImg = await processFile(problem_file);
    const engImg = await processFile(engineering_file);
    const resultImg = await processFile(result_file);

    const db = await openDB();
    await db.run(
      'INSERT INTO etudes_de_cas (title, slug, image_url, problem_text, engineering_text, result_text, problem_image, engineering_image, result_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, slug, dataUrl, problem_text, engineering_text, result_text, problemImg, engImg, resultImg]
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
    const problem_file = formData.get('problem_file');
    const engineering_file = formData.get('engineering_file');
    const result_file = formData.get('result_file');

    if (!id || !title) {
      return NextResponse.json({ error: 'ID et Titre obligatoires' }, { status: 400 });
    }

    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const processFile = async (f) => {
      if (f && f.size > 0) {
        const arrayBuffer = await f.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return `data:${f.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
      }
      return null;
    };

    const dataUrl = await processFile(file);
    const problemImg = await processFile(problem_file);
    const engImg = await processFile(engineering_file);
    const resultImg = await processFile(result_file);

    const db = await openDB();
    
    // Pour l'UPDATE, on ne met à jour l'image que si un nouveau fichier est fourni
    const updates = ['title=?', 'slug=?', 'problem_text=?', 'engineering_text=?', 'result_text=?'];
    const params = [title, slug, problem_text, engineering_text, result_text];

    if (dataUrl) { updates.push('image_url=?'); params.push(dataUrl); }
    if (problemImg) { updates.push('problem_image=?'); params.push(problemImg); }
    if (engImg) { updates.push('engineering_image=?'); params.push(engImg); }
    if (resultImg) { updates.push('result_image=?'); params.push(resultImg); }

    params.push(id); // pour le WHERE id=?

    await db.run(
      `UPDATE etudes_de_cas SET ${updates.join(', ')} WHERE id=?`,
      params
    );

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
