package com.smartqueue.smartqueue.service;


import com.smartqueue.smartqueue.repo.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TokenNumberGenerator {

    private final TokenRepository tokenRepository;

    // Generates TKN-001, TKN-002 ... resets daily
    public String generate() {
        return tokenRepository.findLastTokenToday()
                .map(t -> {
                    int last = Integer.parseInt(t.getTokenNumber().replace("TKN-", ""));
                    return String.format("TKN-%03d", last + 1);
                })
                .orElse("TKN-001");
    }
}