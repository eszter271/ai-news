import { CodeStore } from './code.store';

// 内存验证码存储：开发期零依赖使用
export class MemoryCodeStore extends CodeStore {
  private codes = new Map<string, { code: string; expireAt: number }>();
  private sent = new Map<string, number>();

  async set(key: string, code: string, ttlSec = 300): Promise<void> {
    this.codes.set(key, { code, expireAt: Date.now() + ttlSec * 1000 });
  }

  async take(key: string): Promise<string | null> {
    const v = this.codes.get(key);
    if (!v) return null;
    if (v.expireAt < Date.now()) {
      this.codes.delete(key);
      return null;
    }
    this.codes.delete(key); // 取出即删，防止复用
    return v.code;
  }

  async lastSentAt(key: string): Promise<number | null> {
    return this.sent.get(key) ?? null;
  }

  async markSent(key: string, ttlSec = 60): Promise<void> {
    const ts = Date.now();
    this.sent.set(key, ts);
    const timer = setTimeout(() => {
      if (this.sent.get(key) === ts) this.sent.delete(key);
    }, ttlSec * 1000);
    (timer as any).unref?.();
  }
}
