package com.lastminute.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    public String callGemini(String prompt) {
        try {
            String apiUrl = "https://openrouter.ai/api/v1/chat/completions";
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("HTTP-Referer", "http://localhost:8080");

            String body = String.format(
                "{\"model\": \"openrouter/free\", \"messages\": [{\"role\": \"user\", \"content\": \"%s\"}]}",
                prompt.replace("\"", "'").replace("\n", " ")
            );

            HttpEntity<String> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);
            return response.getBody();
        } catch (Exception e) {
            return "{\"choices\":[{\"message\":{\"content\":\"Sorry, I'm having trouble connecting. Please try again.\"}}]}";
        }
    }
}