import { NextResponse } from 'next/server';
import { openDB } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const db = await openDB();
    const images = await db.all('SELECT * FROM gallery ORDER BY created_at DESC');
    return NextResponse.json(images);
  } catch (error) {
    console.error('Erreur API Gallery GET:', error);
    return NextResponse.json({ error: 'Erreur Serveur' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const caption = formData.get('caption') || '';

    console.log('API Gallery Upload Attempt:', { fileName: file?.name, caption, size: file?.size });

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name;
    const extension = path.extname(originalName);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'gallery', fileName);
    const publicUrl = `/uploads/gallery/${fileName}`;

    // Ensure directory exists (already done by mkdir but good for safety)
    await fs.mkdir(path.dirname(uploadPath), { recursive: true });
    
    // Write the file
    await fs.writeFile(uploadPath, buffer);

    // Save to DB
    const db = await openDB();
    await db.run('INSERT INTO gallery (url, caption) VALUES (?, ?)', [publicUrl, caption]);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Erreur API Gallery POST détaillée:', error);
    return NextResponse.json({ 
      error: 'Erreur d\'importation', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

    const db = await openDB();
    const image = await db.get('SELECT * FROM gallery WHERE id = ?', [id]);

    if (!image) return NextResponse.json({ error: 'Image introuvable' }, { status: 404 });

    // Delete file
    const filePath = path.join(process.cwd(), 'public', image.url);
    try {
      await fs.unlink(filePath);
    } catch (e) {
      console.warn('Fichier image déjà supprimé ou introuvable sur le disque:', filePath);
    }

    // Delete from DB
    await db.run('DELETE FROM gallery WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API Gallery DELETE:', error);
    return NextResponse.json({ error: 'Erreur Serveur' }, { status: 500 });
  }
}
