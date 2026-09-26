package com.wellwipes.aiservice.service;

import com.wellwipes.aiservice.client.GroqClient;
import com.wellwipes.aiservice.dto.SearchResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagService {

    private final VectorStore vectorStore;
    private final GroqClient groqClient;

    public List<SearchResult> search(String query, int topK) {
        var request = SearchRequest.builder()
                .query(query)
                .topK(topK)
                .similarityThreshold(0.0)
                .build();

        List<Document> docs = vectorStore.similaritySearch(request);
        return docs == null ? List.of() : docs.stream().map(this::toResult).toList();
    }

    public Answer ask(String question) {
        List<SearchResult> sources = search(question, 5);

        String context = sources.isEmpty()
                ? "(no matching products found)"
                : sources.stream()
                    .map(s -> "- " + s.metadata().get("name") + " (SKU " + s.metadata().get("sku") + ")")
                    .reduce("", (a, b) -> a + "\n" + b);

        String systemPrompt = """
                You are a helpful assistant for Well-Wipes, a tissue paper e-commerce store.
                Answer the customer's question using ONLY the products listed below.
                If the answer cannot be found in the products, politely say you don't have that information.
                Keep answers short (2-4 sentences) and friendly.
                """;

        String userPrompt = """
                Available products:
                %s

                Customer question: %s
                """.formatted(context, question);

        String answer = groqClient.chat(systemPrompt, userPrompt);
        return new Answer(answer, sources);
    }

    private SearchResult toResult(Document doc) {
        var meta = doc.getMetadata();
        return new SearchResult(
                String.valueOf(meta.get("productId")),
                String.valueOf(meta.get("sku")),
                String.valueOf(meta.get("slug")),
                String.valueOf(meta.get("name")),
                0.0,
                meta
        );
    }

    public record Answer(String answer, List<SearchResult> sources) {}
}
