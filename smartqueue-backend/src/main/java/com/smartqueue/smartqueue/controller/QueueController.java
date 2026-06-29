package com.smartqueue.smartqueue.controller;



import com.smartqueue.smartqueue.dto.*;
        import com.smartqueue.smartqueue.service.QueueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
public class QueueController {

    private final QueueService queueService;

    // Any authenticated user can take a token
    @PostMapping("/issue")
    public ResponseEntity<TokenResponse> issueToken(@Valid @RequestBody TokenRequest request) {
        return ResponseEntity.ok(queueService.issueToken(request));
    }

    // Live queue status — public (no auth needed for display board)
    @GetMapping("/status/{counterId}")
    public ResponseEntity<QueueStatusResponse> getStatus(@PathVariable Long counterId) {
        return ResponseEntity.ok(queueService.getQueueStatus(counterId));
    }

    // Token audit trail
    @GetMapping("/token/{tokenId}/history")
    public ResponseEntity<?> getHistory(@PathVariable Long tokenId) {
        return ResponseEntity.ok(queueService.getTokenHistory(tokenId));
    }
}