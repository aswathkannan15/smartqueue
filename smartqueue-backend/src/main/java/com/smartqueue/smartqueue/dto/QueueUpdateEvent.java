package com.smartqueue.smartqueue.dto;



import com.smartqueue.smartqueue.entity.Token.Priority;
import lombok.*;
        import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class QueueUpdateEvent {

    public enum EventType {
        TOKEN_ISSUED,    // new customer joined the queue
        TOKEN_CALLED,    // staff called next token
        TOKEN_SERVING,   // customer reached the counter
        TOKEN_COMPLETED, // service done
        TOKEN_SKIPPED    // customer didn't show
    }

    private EventType eventType;
    private Long counterId;
    private String counterName;
    private String tokenNumber;
    private Priority priority;
    private String nowServing;       // current token at counter
    private long totalWaiting;       // updated queue depth
    private LocalDateTime timestamp;
}