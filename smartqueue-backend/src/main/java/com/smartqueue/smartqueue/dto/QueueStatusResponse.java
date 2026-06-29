package com.smartqueue.smartqueue.dto;



import lombok.*;
        import java.util.List;

@Data @Builder
public class QueueStatusResponse {
    private Long counterId;
    private String counterName;
    private String nowServing;        // current token being served
    private long totalWaiting;
    private List<TokenResponse> waitingTokens;
}