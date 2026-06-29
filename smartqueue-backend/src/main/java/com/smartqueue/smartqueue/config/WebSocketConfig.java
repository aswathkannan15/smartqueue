package com.smartqueue.smartqueue.config;



import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker   // turns on WebSocket + STOMP support
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // "/topic" = server broadcasts TO clients (one → many)
        // "/queue" = server sends TO specific client (one → one)
        config.enableSimpleBroker("/topic", "/queue");

        // "/app" prefix = messages coming FROM clients TO server
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")          // clients connect here
                .setAllowedOrigins("http://localhost:3000")
                .withSockJS();               // fallback for older browsers
    }
}