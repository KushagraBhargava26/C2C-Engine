package com.c2c.backend.client;

import com.c2c.backend.dto.PythonAnalysisRequest;
import com.c2c.backend.dto.PythonAnalysisResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class PythonAnalysisClient {

    private final WebClient webClient;

    public PythonAnalysisClient(@Value("${python.service.baseurl}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public PythonAnalysisResponse analyze(PythonAnalysisRequest request) {
        return webClient.post()
                .uri("/api/v1/analyze")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(PythonAnalysisResponse.class)
                .block();
    }
}