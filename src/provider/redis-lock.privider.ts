import Redlock from 'redlock';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisLockProvider extends Redlock {
    constructor(configService: ConfigService) {
        const redisHost = configService.get<string>('REDIS_HOST');
        const redisPort = configService.get<number>('REDIS_PORT');

        if (!redisHost || !redisPort) {
            throw new Error('Missing REDIS_HOST or REDIS_PORT in environment');
        }

        const redis = new Redis({
            host: redisHost,
            port: redisPort,
        });

        super([redis]);
    }
}
