package com.smartqueue.smartqueue.controller;



import com.smartqueue.smartqueue.dto.TokenResponse;
import com.smartqueue.smartqueue.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

        import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class StaffController {

    private final QueueService queueService;

    @PostMapping("/counter/{counterId}/call-next")
    public ResponseEntity<TokenResponse> callNext(@PathVariable Long counterId) {
        return ResponseEntity.ok(queueService.callNext(counterId));
    }

    @PutMapping("/token/{tokenId}/serving")
    public ResponseEntity<TokenResponse> markServing(@PathVariable Long tokenId) {
        return ResponseEntity.ok(queueService.markServing(tokenId));
    }

    @PutMapping("/token/{tokenId}/complete")
    public ResponseEntity<TokenResponse> complete(@PathVariable Long tokenId) {
        return ResponseEntity.ok(queueService.completeToken(tokenId));
    }

    @PutMapping("/token/{tokenId}/skip")
    public ResponseEntity<TokenResponse> skip(@PathVariable Long tokenId,
                                              @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(queueService.skipToken(tokenId, body.get("reason")));
    }
}