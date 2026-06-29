package com.smartqueue.smartqueue.dto;

import com.smartqueue.smartqueue.entity.Token;
import com.smartqueue.smartqueue.entity.Token.*;
        import lombok.*;
        import java.time.LocalDateTime;

@Data @Builder
public class TokenResponse {
    private Long id;
    private String tokenNumber;
    private Priority priority;
    private Status status;
    private String counterName;
    private Long counterId;
    private String issuedByName;
    private LocalDateTime issuedAt;
    private LocalDateTime calledAt;
    private LocalDateTime completedAt;
    private long waitingAhead;   // how many tokens ahead in queue

    public static TokenResponse from(Token t, long waitingAhead) {
        return TokenResponse.builder()
                .id(t.getId())
                .tokenNumber(t.getTokenNumber())
                .priority(t.getPriority())
                .status(t.getStatus())
                .counterName(t.getCounter() != null ? t.getCounter().getName() : null)
                .counterId(t.getCounter() != null ? t.getCounter().getId() : null)
                .issuedByName(t.getIssuedBy() != null ? t.getIssuedBy().getName() : null)
                .issuedAt(t.getIssuedAt())
                .calledAt(t.getCalledAt())
                .completedAt(t.getCompletedAt())
                .waitingAhead(waitingAhead)
                .build();
    }
}