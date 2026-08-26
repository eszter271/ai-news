// 抽象类：既能当类型又能当 DI 值（避免 interface 的"only refers to a type"错误）
export abstract class CodeStore {
  abstract set(key: string, code: string, ttlSec?: number): Promise<void>;
  abstract take(key: string): Promise<string | null>;
  abstract lastSentAt(key: string): Promise<number | null>;
  abstract markSent(key: string, ttlSec?: number): Promise<void>;
}
