import { applyDecorators, SetMetadata } from '@nestjs/common';
import { REDIS_LOCK_METADATA } from '../constant/redis-lock.constant';
import { RedisLockDecoratorOptions } from '../interface/redis-lock.interface';

export function RedisLock(options: RedisLockDecoratorOptions): MethodDecorator {
    return (target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): void => {
        const className = target.constructor?.name ?? 'UnknownClass';
        const methodName = propertyKey.toString();

        const generatedKey = `${className}.${methodName}`;
        const redisKey = options.key ?? generatedKey;

        return applyDecorators(
            SetMetadata(REDIS_LOCK_METADATA, {
                ttl: options.ttl,
                key: redisKey
            })
        )(target, propertyKey, descriptor);
    };
}
