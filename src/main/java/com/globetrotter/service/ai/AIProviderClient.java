package com.globetrotter.service.ai;

public interface AIProviderClient {
    boolean isAvailable();
    String generateTripJson(String systemPrompt, String userPrompt);
}
