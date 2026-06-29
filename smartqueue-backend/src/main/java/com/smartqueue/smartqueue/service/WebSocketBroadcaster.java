package com.smartqueue.smartqueue.service;



import com.smartqueue.smartqueue.dto.QueueUpdateEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketBroadcaster {

    // Spring's built-in tool for sending WebSocket messages
    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastQueueUpdate(Long counterId, QueueUpdateEvent event) {
        String destination = "/topic/queue/" + counterId;
        // e.g. "/topic/queue/1" — everyone watching Counter 1 gets this

        messagingTemplate.convertAndSend(destination, event);

        log.info("Broadcast to {}: {} — Token {}",
                destination, event.getEventType(), event.getTokenNumber());
    }

    public void broadcastToAllCounters(QueueUpdateEvent event) {
        // Used for global admin dashboard updates
        messagingTemplate.convertAndSend("/topic/queue/all", event);
    }
}