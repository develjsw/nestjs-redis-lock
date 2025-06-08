/**
 * - ( essential ) ttl : milliseconds
 * - ( optional ) key
 * */
export interface RedisLockDecoratorOptions {
    ttl: number;
    key?: string;
}
