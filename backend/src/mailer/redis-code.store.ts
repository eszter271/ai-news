import { CodeStore } from './code.store';

// Redis 验证码存储：生产使用
export class RedisCodeStore extends CodeStore {
  private redis: any;
  private prefix = 'ai-news:code:';

  constructor(redisUrl: string) {
    super();
    // lazy require
    const IoRedis = require('ioredis');
    this.redis = new IoRedis(redisUrl, { lazyConnect: false });
  }

  async set(key: string, code: string, ttlSec = 300): Promise<void> {
    await this.redis.set(`${this.prefix}c:${key}`, code, 'EX', ttlSec);
  }

  async take(key: string): Promise<string | null> {
    const k = `${this.prefix}c:${key}`;
    const code = (await this.redis.get(k)) as string | null;
    if (code) await this.redis.del(k);
    return code;
  }

  async lastSentAt(key: string): Promise<number | null> {
    const v = (await this.redis.get(`${this.prefix}t:${key}`)) as string | null;
    return v ? Number(v) : null;
  }

  async markSent(key: string, ttlSec = 60): Promise<void> {
    await this.redis.set(`${this.prefix}t:${key}`, Date.now(), 'EX', ttlSec);
  }
}
