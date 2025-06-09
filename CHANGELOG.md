## [2.0.2] - 2025-06-09

### Documentation
- Improved wording in the README to avoid confusion about provider registration and decorator usage
- Simplified explanation of how the @RedisLock() decorator works and where it can be applied

---

## [2.0.1] - 2025-06-09

### Added
- Added more helpful debug logs when releasing locks
  - If a lock has already expired, a debug message now shows the full Redis key to make it easier to understand what happened
---

## [2.0.0] - 2025-06-09
### Changed
- Controllers are no longer scanned for `@RedisLock()`-decorated methods
- The decorator is now strictly limited to methods in `@Injectable()` classes (e.g., services)
- Updated documentation to reflect this behavior

### Migration Guide
- If you were using `@RedisLock()` in controllers, move those methods to a service and call the service from your controller or cron job