# nestjs-redis-lock

> A NestJS decorator-based Redis distributed lock module using Redlock

Provides a simple `@RedisLock()` decorator to prevent concurrent job executions across distributed instances (e.g., Cron jobs, tasks)

---

## Installation

```bash
npm install nestjs-redis-lock ioredis redlock @nestjs/config
```

## Usage
1. Register ConfigModule & Import the Module
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
2. Apply the @RedisLock() Decorator
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
   > ⚠️ Note
   The @RedisLock() decorator must be applied to methods inside @Injectable() classes (e.g., services).
   It will not work on methods inside @Controller() classes due to how NestJS internally proxies controller methods.

   > ✅ Recommended usage: put the lock on a service method, and call that from the controller or cron job.
3. Set Environment Variables
   ```dotenv
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

## How It Works
- The @RedisLock() decorator adds metadata to methods
- At module init, all providers and controllers are scanned for those methods
- Target methods are dynamically wrapped to acquire a distributed lock using Redlock
- If the lock is acquired, the method is executed. Otherwise, it is skipped or rejected
   
## License
MIT