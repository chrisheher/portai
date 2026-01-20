// src/lib/db/shareableResults.ts
import { nanoid } from 'nanoid';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.reslink_REDIS_URL!,
  token: process.env.reslink_REDIS_TOKEN!,
});

/**
 * Store analysis result and return short ID
 */
export async function storeAnalysis(data: any): Promise<string> {
  const id = nanoid(10);
  
  await redis.set(`analysis:${id}`, JSON.stringify(data), {
    ex: 30 * 24 * 60 * 60, // 30 days
  });
  
  console.log(`💾 Stored analysis with ID: ${id}`);
  return id;
}

/**
 * Retrieve analysis result by ID
 */
export async function getAnalysis(id: string): Promise<any | null> {
  try {
    const data = await redis.get(`analysis:${id}`);
    
    if (!data) {
      console.log(`❌ Analysis not found: ${id}`);
      return null;
    }
    
    console.log(`✅ Retrieved analysis: ${id}`);
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('❌ Error retrieving analysis:', error);
    return null;
  }
}