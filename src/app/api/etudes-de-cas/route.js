import { NextResponse } from 'next/server';
import { openDB } from '@/lib/db';

export async function GET() {
  try {
    const db = await openDB();
    const etudes = await db.all('SELECT id, title, slug, image_url, problem_image, engineering_image, result_image, problem_text, engineering_text, result_text, status, created_at FROM etudes_de_cas ORDER BY created_at DESC');
    return NextResponse.json(etudes);
  } catch (error) {
    console.error('Erreur API Publique Etudes GET:', error);
    return NextResponse.json({ error: 'Erreur Serveur' }, { status: 500 });
  }
}
