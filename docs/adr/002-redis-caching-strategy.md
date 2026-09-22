# ADR-002: Redis Read-Through Cache for Product Catalog

## Status
Accepted

## Context
Product browsing is read-heavy (many more GETs than writes). The catalog
data is stable enough to cache briefly. We need to reduce DB load and P95
latency for the frontend catalog and product detail pages.

Options:
1. No cache — query Postgres on every request
2. JVM-local cache (Caffeine) — fast but each instance has its own copy
3. Redis read-through cache — shared across instances, survives restarts

## Decision
Option 3, with per-cache TTLs.

- `products` cache (product detail by id/slug): 10 minutes
- `productLists` cache (paginated lists, search): 5 minutes
- `categories` cache (all active categories): 30 minutes

Read paths use Spring's `@Cacheable`. Write paths use `@CacheEvict`:
- Update/delete evict both `products::{id}` and clear all `productLists`
- Create clears all `productLists`

Serializer is `GenericJackson2JsonRedisSerializer` with `JavaTimeModule`
and default typing enabled. Java serialization is avoided because:
- It ties cached data to class `serialVersionUID` (breaks on DTO changes)
- It is unreadable with `redis-cli` (debugging is harder)

## Consequences
+ Read latency drops for catalog pages
+ DB load scales with writes, not reads
+ Cache is inspectable and shareable across service instances
+ TTLs are asymmetric — frequently changing lists expire faster
- Every write flushes all list caches (coarse invalidation in V1)
- Cache stampede risk if a hot key expires under load (V2: single-flight)
- Requires Redis as a critical path dependency (V2: circuit breaker)

## Alternatives Rejected
- Local Caffeine cache: stale across instances, no coordination on writes
- 2-level cache: complexity not justified at this scale
- No cache: acceptable for V1 correctness, bad for demo metrics
