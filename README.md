# nestjs-redis-lock

> A NestJS decorator-based Redis distributed lock module using Redlock

Provides a simple `@RedisLock()` decorator to prevent concurrent job executions across multiple instances (e.g., Cron jobs, tasks)

---

## Installation

```bash
npm install nestjs-redis-lock ioredis redlock @nestjs/config
```

## Usage
1. Register ConfigModule & Import The Module
    ```ts
    import { ConfigModule } from '@nestjs/config';
    import { RedisLockModule } from 'nestjs-redis-lock';

    @Module({
        imports: [
            ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            RedisLockModule
        ],
    })
    export class AppModule {}
    ```
2. Apply The @RedisLock() Decorator
   ```ts
   import { Injectable } from '@nestjs/common';
   import { RedisLock } from 'nestjs-redis-lock';

   @Injectable()
   export class MyService {
       @RedisLock({ ttl: 1000 * 10 }) // optional: key
       async handleJob(): Promise<void> {
           console.log('Job started...');
           await new Promise((res) => setTimeout(res, 5000));
           console.log('Job finished!');
       }
   }
   ```
   ⚠️ Note
   - The `@RedisLock()` decorator applies to methods in classes that are registered as **providers** (which are typically marked with `@Injectable()`)
   - While `@Injectable()` is not strictly required if the class is registered manually, it is strongly recommended
   - Methods in `@Controller()` classes are not supported


3. Set Environment Variables
   ```dotenv
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

## How It Works
- The @RedisLock() decorator stores metadata on methods in registered providers
- At module startup, all providers (except controllers) are scanned for decorated methods
- These methods are dynamically wrapped to acquire a distributed lock using Redlock before execution
- If the lock is acquired, the method runs; otherwise, it is skipped or throws an error (based on implementation)
- After the method completes, the lock is released. If it has already expired (e.g., due to TTL), the lock manager logs a debug message with the key

## Debugging

When a task takes longer than the lock TTL, the lock may expire before it is released. In this case, the system logs a debug message like the following :
> [ DEBUG ] Lock release skipped (likely expired) : redisKey="batch-server:lock:MyService.handleJob"
  
## License
MIT