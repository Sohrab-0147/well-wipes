package com.wellwipes.aiservice.service;

import com.wellwipes.aiservice.client.ProductFetcher;
import com.wellwipes.aiservice.dto.ReindexResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmbeddingService {

    private final ProductFetcher productFetcher;
    private final VectorStore vectorStore;

    public ReindexResponse reindexAll() {
        long start = System.currentTimeMillis();
        List<Map<String, Object>> products = productFetcher.fetchAll();
        log.info("Fetched {} products from product-service", products.size());

        if (products.isEmpty()) {
            return new ReindexResponse(0, System.currentTimeMillis() - start);
        }

        List<Document> documents = products.stream()
                .map(this::toDocument)
                .toList();

        vectorStore.add(documents);
        long duration = System.currentTimeMillis() - start;
        log.info("Indexed {} products in {} ms", documents.size(), duration);
        return new ReindexResponse(documents.size(), duration);
    }

    private Document toDocument(Map<String, Object> product) {
        String id = String.valueOf(product.get("id"));
        String sku = String.valueOf(product.get("sku"));
        String slug = String.valueOf(product.get("slug"));
        String name = String.valueOf(product.get("name"));
        String shortDesc = product.get("shortDescription") == null ? "" : String.valueOf(product.get("shortDescription"));
        String description = product.get("description") == null ? "" : String.valueOf(product.get("description"));
        Object attributes = product.get("attributes");

        String content = """
                Product: %s
                SKU: %s
                Summary: %s
                Description: %s
                Attributes: %s
                """.formatted(name, sku, shortDesc, description, attributes);

        return new Document(content, Map.of(
                "productId", id,
                "sku", sku,
                "slug", slug,
                "name", name
        ));
    }
}
