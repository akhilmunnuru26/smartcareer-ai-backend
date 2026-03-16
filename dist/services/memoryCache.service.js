"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryCache = void 0;
class MemoryCacheService {
    constructor() {
        this.cache = new Map();
        // Clean up expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }
    // Generate cache key
    generateKey(prefix, data) {
        const crypto = require('crypto');
        const hash = crypto
            .createHash('md5')
            .update(JSON.stringify(data))
            .digest('hex');
        return `${prefix}:${hash}`;
    }
    // Get from cache
    get(key) {
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
        return entry.data;
    }
    // Set cache with TTL in seconds
    set(key, data, ttlSeconds = 3600) {
        const expiresAt = Date.now() + (ttlSeconds * 1000);
        this.cache.set(key, { data, expiresAt });
        console.log(`💾 Cached: ${key} (expires in ${ttlSeconds}s)`);
    }
    // Delete from cache
    delete(key) {
        this.cache.delete(key);
        console.log('🗑️ Cache deleted:', key);
    }
    // Clear all cache
    clear() {
        this.cache.clear();
        console.log('🗑️ All cache cleared');
    }
    // Clean up expired entries
    cleanup() {
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
    getResumeAnalysisKey(resumeText, targetRole) {
        return this.generateKey('resume', { resumeText, targetRole });
    }
    getInterviewQuestionsKey(role, difficulty) {
        return this.generateKey('interview', { role, difficulty });
    }
    getJobMatchKey(resumeText, jobDescription) {
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
exports.memoryCache = new MemoryCacheService();
