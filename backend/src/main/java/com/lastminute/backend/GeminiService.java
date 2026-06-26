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
            String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=" + apiKey;
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String body = String.format(
                "{\"contents\": [{\"parts\": [{\"text\": \"%s\"}]}]}",
                prompt.replace("\"", "'").replace("\n", " ")
            );
            HttpEntity<String> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);
            return response.getBody();
        } catch (Exception e) {
            return "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"Sorry, I'm having trouble connecting. Please try again in a moment.\"}]}}]}";
        }
    }
}