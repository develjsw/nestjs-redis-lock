import { ConflictException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import Redlock, { Lock } from 'redlock';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { REDIS_LOCK_METADATA, REDIS_LOCK_PREFIX } from '../constant/redis-lock.constant';

@Injectable()
export class RedisLockManagerService {
    private readonly usedKeys = new Set<string>();

    constructor(
        private readonly redLock: Redlock,

        private readonly discoveryService: DiscoveryService,
        private readonly metadataScanner: MetadataScanner,
        private readonly reflector: Reflector
    ) {}

    public applyRedisLocks(): void {
        const instances: InstanceWrapper[] = this.getAllStaticNestInstances();

        instances.forEach(({ instance }) => {
            const prototype = Object.getPrototypeOf(instance);
            const methodNames: string[] = this.metadataScanner.getAllMethodNames(prototype);

            methodNames.forEach((methodName: string): void => {
                this.wrapMethodWithRedisLock(instance, prototype, methodName);
            });
        });
    }

    private getAllStaticNestInstances(): InstanceWrapper[] {
        return this.discoveryService
            .getProviders()
            .filter((wrapper): boolean => wrapper.isDependencyTreeStatic())
            .filter(({ instance }) => !!instance && Object.getPrototypeOf(instance));
    }

    private wrapMethodWithRedisLock(instance: any, prototype: object, methodName: string): void {
        const methodRef = Reflect.get(prototype, methodName) as Function;
        const meta = this.reflector.get<{ key: string; ttl: number }>(REDIS_LOCK_METADATA, methodRef);

        if (!meta) return;

        const { key, ttl } = meta;
        const redisKey = this.buildRedisLockKey(key);

        if (this.usedKeys.has(redisKey)) {
            throw new ConflictException(`Duplicate redisLock key detected : "${redisKey}"`);
        }

        this.usedKeys.add(redisKey);

        const wrapped = async (...args: unknown[]): Promise<void> => {
            await this.runTaskWithLock(key, ttl, async (): Promise<void> => {
                await methodRef.call(instance, ...args);
            });
        };

        Object.setPrototypeOf(wrapped, methodRef);
        instance[methodName] = wrapped;
    }

    private buildRedisLockKey(key: string): string {
        return `${REDIS_LOCK_PREFIX}:${key}`;
    }

    async runTaskWithLock(key: string, ttl: number, task: () => Promise<void>): Promise<void> {
        let lock: Lock | undefined;

        try {
            lock = await this.redLock.acquire([this.buildRedisLockKey(key)], ttl);
            await task();
        } catch (error) {
            throw new InternalServerErrorException(
                `An error occurred while executing the Redis-locked task for key "${key}"`
            );
        } finally {
            if (lock) {
                await lock
                    .release()
                    .catch((error) =>
                        Logger.debug(
                            `Lock release skipped (likely expired) : redisKey="${this.buildRedisLockKey(key)}"`
                        )
                    );
            }
        }
    }
}
