# nestjs-redis-lock

> A NestJS decorator-based Redis distributed lock module using Redlock

Provides a simple `@RedisLock()` decorator to prevent concurrent job executions across distributed instances (e.g., Cron jobs, tasks)

---

## Installation

```bash
npm install nestjs-redis-lock ioredis redlock
```

## Usage
1. Import the Module
    ```ts
    import { RedisLockModule } from 'nestjs-redis-lock';

    @Module({
        imports: [RedisLockModule],
    })
    export class AppModule {}
    ```
2. Apply the @RedisLock() Decorator
   ```ts
   import { Cron } from '@nestjs/schedule';
   import { RedisLock } from 'nestjs-redis-lock';

   @Cron('* * * * * *')
   @RedisLock({ ttl: 1000 * 10 }) // optional: key
   async handleJob(): Promise<void> {
       console.log('job running...');
   }
   ```
3. Set Environment Variables
   ```dotenv
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```
   
## License
MIT