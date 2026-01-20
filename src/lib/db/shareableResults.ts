// src/lib/db/shareableResults.ts
import { nanoid } from 'nanoid';
import { put, list } from '@vercel/blob';

export async function storeAnalysis(data: any): Promise<string> {
  const id = nanoid(10);
  
  await put(`analysis/${id}.json`, JSON.stringify(data), {
    access: 'public',
    contentType: 'application/json',
  });
  
  console.log(`💾 Stored analysis with ID: ${id}`);
  return id;
}

export async function getAnalysis(id: string): Promise<any | null> {
  try {
    // List blobs to find the URL
    const { blobs } = await list({ prefix: `analysis/${id}` });
    
    if (blobs.length === 0) {
      console.log(`❌ Analysis not found: ${id}`);
      return null;
    }
    
    // Fetch the blob content
    const response = await fetch(blobs[0].url);
    const data = await response.json();
    
    console.log(`✅ Retrieved analysis: ${id}`);
    return data;
  } catch (error) {
    console.error('❌ Error retrieving analysis:', error);
    return null;
  }
}