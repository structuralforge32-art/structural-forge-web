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

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    }

    // Convert file to Base64 for database storage (Vercel bypass)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Content = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Content}`;

    // Save to DB
    const db = await openDB();
    await db.run('INSERT INTO gallery (url, caption) VALUES (?, ?)', [dataUrl, caption]);

    console.log('Gallery Upload Success (Base64 stored in DB)');
    return NextResponse.json({ success: true, url: dataUrl });
  } catch (error) {
    console.error('Erreur API Gallery POST:', error);
    return NextResponse.json({ 
      error: 'Erreur d\'importation', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

    const db = await openDB();
    
    // In Base64 mode, we only need to delete from DB
    await db.run('DELETE FROM gallery WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API Gallery DELETE:', error);
    return NextResponse.json({ error: 'Erreur Serveur' }, { status: 500 });
  }
}
