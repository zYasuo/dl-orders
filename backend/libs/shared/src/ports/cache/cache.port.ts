export abstract class CachePort {
  abstract get(key: string): Promise<string | null>;
  abstract set(key: string, value: string, ttl: number): Promise<void>;
  abstract setIfNotExists(key: string, value: string, ttl: number): Promise<boolean>;
  abstract del(key: string): Promise<void>;
  abstract delIfEquals(key: string, value: string): Promise<boolean>;
  abstract exists(key: string): Promise<boolean>;
  abstract getJson<T>(key: string): Promise<T | null>;
  abstract setJson<T>(key: string, value: T, ttl: number): Promise<void>;
  abstract incr(key: string): Promise<number>;
}
