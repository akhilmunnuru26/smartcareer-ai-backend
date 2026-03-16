interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  // Generate cache key
  private generateKey(prefix: string, data: any): string {
    const crypto = require('crypto');
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');
    return `${prefix}:${hash}`;
  }

  // Get from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      console.log('❌ Cache MISS:', key);
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      console.log('⏰ Cache EXPIRED:', key);
      return null;
    }

    console.log('✅ Cache HIT:', key);
    return entry.data as T;
  }

  // Set cache with TTL in seconds
  set<T>(key: string, data: T, ttlSeconds: number = 3600): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiresAt });
    console.log(`💾 Cached: ${key} (expires in ${ttlSeconds}s)`);
  }

  // Delete from cache
  delete(key: string): void {
    this.cache.delete(key);
    console.log('🗑️ Cache deleted:', key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    console.log('🗑️ All cache cleared');
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
    }
  }

  // Helper methods for specific cache keys
  getResumeAnalysisKey(resumeText: string, targetRole?: string): string {
    return this.generateKey('resume', { resumeText, targetRole });
  }

  getInterviewQuestionsKey(role: string, difficulty: string): string {
    return this.generateKey('interview', { role, difficulty });
  }

  getJobMatchKey(resumeText: string, jobDescription: string): string {
    return this.generateKey('jobmatch', { resumeText, jobDescription });
  }

  // Get cache stats
  getStats() {
    return {
      totalEntries: this.cache.size,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
    };
  }
}

export const memoryCache = new MemoryCacheService();