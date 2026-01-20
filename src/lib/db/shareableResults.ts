// src/lib/db/shareableResults.ts
import { nanoid } from 'nanoid';

interface ShareableResult {
  id: string;
  data: any;
  createdAt: Date;
  expiresAt: Date;
}

// Use global to persist across hot reloads in development
declare global {
  var analysisStore: Map<string, ShareableResult> | undefined;
}

// Initialize or reuse existing store
const memoryStore = global.analysisStore || new Map<string, ShareableResult>();

if (process.env.NODE_ENV !== 'production') {
  global.analysisStore = memoryStore;
}

/**
 * Store analysis result and return short ID
 */
export async function storeAnalysis(data: any): Promise<string> {
  const id = nanoid(10);
  
  const result: ShareableResult = {
    id,
    data,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  };
  
  // Store in memory
  memoryStore.set(id, result);
  
  console.error(`💾 Stored analysis with ID: ${id} (in-memory, ${memoryStore.size} total stored)`);
  console.error(`📋 Available IDs: ${Array.from(memoryStore.keys()).join(', ')}`);
  
  return id;
}

/**
 * Retrieve analysis result by ID
 */
export async function getAnalysis(id: string): Promise<any | null> {
  try {
    console.error(`🔍 Looking for ID: ${id} in store with ${memoryStore.size} items`);
    console.error(`📋 Available IDs: ${Array.from(memoryStore.keys()).join(', ')}`);
    
    const result = memoryStore.get(id);
    
    if (!result) {
      console.error(`❌ Analysis not found: ${id}`);
      return null;
    }
    
    // Check if expired
    if (result.expiresAt < new Date()) {
      memoryStore.delete(id);
      console.error(`⏰ Analysis expired: ${id}`);
      return null;
    }
    
    console.error(`✅ Retrieved analysis: ${id}`);
    return result.data;
  } catch (error) {
    console.error('❌ Error retrieving analysis:', error);
    return null;
  }
}

/**
 * Clear expired entries (optional cleanup)
 */
export function cleanupExpired(): number {
  const now = new Date();
  let cleaned = 0;
  
  for (const [id, result] of memoryStore.entries()) {
    if (result.expiresAt < now) {
      memoryStore.delete(id);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.error(`🧹 Cleaned up ${cleaned} expired entries`);
  }
  
  return cleaned;
}

/**
 * Get store stats (for debugging)
 */
export function getStoreStats() {
  return {
    totalItems: memoryStore.size,
    ids: Array.from(memoryStore.keys())
  };
}