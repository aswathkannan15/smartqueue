package com.smartqueue.smartqueue.controller;



import com.smartqueue.smartqueue.dto.QueueStatusResponse;
import com.smartqueue.smartqueue.service.QueueService;
import com.smartqueue.smartqueue.service.WebSocketBroadcaster;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
        import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final QueueService queueService;

    // When a client subscribes to a counter channel,
    // immediately send them the current queue state
    // so they don't see a blank screen while waiting for the first event
    @SubscribeMapping("/topic/queue/{counterId}")
    public QueueStatusResponse onSubscribe(@DestinationVariable Long counterId) {
        return queueService.getQueueStatus(counterId);
    }
}