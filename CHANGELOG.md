## [2.0.0] - 2025-06-09
### Changed
- Controllers are no longer scanned for `@RedisLock()`-decorated methods
- The decorator is now strictly limited to methods in `@Injectable()` classes (e.g., services)
- Updated documentation to reflect this behavior

### Migration Guide
- If you were using `@RedisLock()` in controllers, move those methods to a service and call the service from your controller or cron job.