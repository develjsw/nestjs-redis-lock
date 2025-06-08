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
   The @RedisLock() decorator only applies to methods defined in classes annotated with @Injectable()
   Methods in @Controller() classes are intentionally excluded from scanning,
   because NestJS binds controller methods at runtime before decorators can dynamically wrap them

3. Set Environment Variables
   ```dotenv
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

## How It Works
- The `@RedisLock()` decorator stores metadata on methods in `@Injectable()` classes
- At module initialization, all **providers** (excluding controllers) are scanned for methods decorated with `@RedisLock()`
- Those methods are dynamically wrapped to acquire a distributed lock using Redlock before execution
- If the lock is successfully acquired, the method is executed; otherwise, it is skipped or throws an error (depending on implementation)
- When the task completes, the lock is automatically released. If the lock has already expired (e.g., due to TTL), the system will skip release and log a debug message with the key context

## Debugging

When a task takes longer than the lock TTL, the lock may expire before it is released. In this case, the system logs a debug message like the following :
> [DEBUG] Lock release skipped (likely expired) : redisKey="batch-server:lock:MyService.handleJob"
  
## License
MIT