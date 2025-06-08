import { Global, Module, OnModuleInit } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { RedisLockProvider } from './provider/redis-lock.privider';
import Redlock from 'redlock';
import { RedisLockManagerService } from './service/redis-lock-manager.service';

@Global()
@Module({
    imports: [DiscoveryModule],
    providers: [
        {
            provide: Redlock,
            useClass: RedisLockProvider
        },
        RedisLockManagerService
    ],
    exports: [Redlock]
})
export class RedisLockModule implements OnModuleInit {
    constructor(private readonly redisLockManagerService: RedisLockManagerService) {}

    onModuleInit(): void {
        this.redisLockManagerService.applyRedisLocks();
    }
}
