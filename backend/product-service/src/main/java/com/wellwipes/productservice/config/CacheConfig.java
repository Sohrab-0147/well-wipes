package com.wellwipes.productservice.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String PRODUCTS = "products";
    public static final String PRODUCT_LISTS = "productLists";
    public static final String CATEGORIES = "categories";

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(PRODUCTS, PRODUCT_LISTS, CATEGORIES);
    }
}
