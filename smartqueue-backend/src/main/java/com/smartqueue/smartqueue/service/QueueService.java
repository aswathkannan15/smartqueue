package com.smartqueue.smartqueue.service;



import com.smartqueue.smartqueue.dto.*;
        import com.smartqueue.smartqueue.entity.*;
        import com.smartqueue.smartqueue.entity.Token.*;
        import com.smartqueue.smartqueue.repo.*;
        import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QueueService {

    private final TokenRepository tokenRepository;
    private final AuditLogRepository auditLogRepository;
    private final CounterRepository counterRepository;
    private final UserRepository userRepository;
    private final TokenNumberGenerator tokenNumberGenerator;

    private final WebSocketBroadcaster broadcaster;

    // ── Issue token ──────────────────────────────────────────────
    @Transactional
    public TokenResponse issueToken(TokenRequest request) {
        Counter counter = counterRepository.findById(request.getCounterId())
                .orElseThrow(() -> new IllegalArgumentException("Counter not found"));

        if (!counter.getIsActive()) {
            throw new IllegalStateException("Counter is not active");
        }

        User issuedBy = getCurrentUser();

        tokenRepository.findActiveTokenByUser(issuedBy.getId())
                .ifPresent(existingToken -> {
                    throw new IllegalStateException("You already have an active token: " + existingToken.getTokenNumber());
                });

        Token token = Token.builder()
                .tokenNumber(tokenNumberGenerator.generate())
                .priority(request.getPriority())
                .status(Status.WAITING)
                .counter(counter)
                .issuedBy(issuedBy)
                .issuedAt(LocalDateTime.now())
                .build();

        tokenRepository.save(token);
        logAction(token, issuedBy, AuditLog.Action.ISSUED, null);

        long ahead = tokenRepository.countWaitingByCounter(counter.getId()) - 1;
        // After saving token and logging audit...
        broadcaster.broadcastQueueUpdate(counter.getId(),
                buildEvent(QueueUpdateEvent.EventType.TOKEN_ISSUED, token, counter));

        return TokenResponse.from(token, Math.max(ahead, 0));
    }

    // ── Call next token (priority order) ─────────────────────────
    @Transactional
    public TokenResponse callNext(Long counterId) {
        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new IllegalArgumentException("Counter not found"));

        Token next = tokenRepository.findNextToken(counterId)
                .orElseThrow(() -> new IllegalStateException("No tokens waiting"));

        next.setStatus(Status.CALLED);
        next.setCalledAt(LocalDateTime.now());
        tokenRepository.save(next);

        User actor = getCurrentUser();
        logAction(next, actor, AuditLog.Action.CALLED, null);

        broadcaster.broadcastQueueUpdate(counterId,
                buildEvent(QueueUpdateEvent.EventType.TOKEN_CALLED, next, counter));

        return TokenResponse.from(next, 0);


    }

    // ── Mark as serving ───────────────────────────────────────────
    @Transactional
    public TokenResponse markServing(Long tokenId) {
        Token token = getToken(tokenId);
        if (token.getStatus() != Status.CALLED) {
            throw new IllegalStateException("Token must be in CALLED state to mark as SERVING");
        }
        token.setStatus(Status.SERVING);
        tokenRepository.save(token);
        logAction(token, getCurrentUser(), AuditLog.Action.SERVING, null);
        return TokenResponse.from(token, 0);
    }

    // ── Complete token ────────────────────────────────────────────
    @Transactional
    public TokenResponse completeToken(Long tokenId) {
        Token token = getToken(tokenId);
        if (token.getStatus() != Status.SERVING && token.getStatus() != Status.CALLED) {
            throw new IllegalStateException("Token must be CALLED or SERVING to complete");
        }
        token.setStatus(Status.COMPLETED);
        token.setCompletedAt(LocalDateTime.now());
        tokenRepository.save(token);
        logAction(token, getCurrentUser(), AuditLog.Action.COMPLETED, null);
        broadcaster.broadcastQueueUpdate(token.getCounter().getId(),
                buildEvent(QueueUpdateEvent.EventType.TOKEN_COMPLETED, token, token.getCounter()));

        return TokenResponse.from(token, 0);
    }

    // ── Skip token ────────────────────────────────────────────────
    @Transactional
    public TokenResponse skipToken(Long tokenId, String reason) {
        Token token = getToken(tokenId);
        if (token.getStatus() != Status.CALLED) {
            throw new IllegalStateException("Only CALLED tokens can be skipped");
        }
        token.setStatus(Status.SKIPPED);
        tokenRepository.save(token);
        logAction(token, getCurrentUser(), AuditLog.Action.SKIPPED, reason);
        broadcaster.broadcastQueueUpdate(token.getCounter().getId(),
                buildEvent(QueueUpdateEvent.EventType.TOKEN_SKIPPED, token, token.getCounter()));

        return TokenResponse.from(token, 0);
    }

    // ── Queue status for a counter ────────────────────────────────
    @Transactional(readOnly = true)
    public QueueStatusResponse getQueueStatus(Long counterId) {
        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new IllegalArgumentException("Counter not found"));

        List<Token> waiting = tokenRepository
                .findByCounterIdAndStatusOrderByIssuedAtAsc(counterId, Status.WAITING);

        // Find currently serving or called token
        List<Token> active = tokenRepository
                .findByCounterIdAndStatusOrderByIssuedAtAsc(counterId, Status.SERVING);
        if (active.isEmpty()) {
            active = tokenRepository
                    .findByCounterIdAndStatusOrderByIssuedAtAsc(counterId, Status.CALLED);
        }

        String nowServing = active.isEmpty() ? "---" : active.get(0).getTokenNumber();

        List<TokenResponse> waitingResponses = waiting.stream()
                .map(t -> TokenResponse.from(t, waiting.indexOf(t)))
                .toList();

        return QueueStatusResponse.builder()
                .counterId(counterId)
                .counterName(counter.getName())
                .nowServing(nowServing)
                .totalWaiting((long) waiting.size())
                .waitingTokens(waitingResponses)
                .build();
    }

    // ── Token history by ID ───────────────────────────────────────
    public List<AuditLog> getTokenHistory(Long tokenId) {
        return auditLogRepository.findByTokenIdOrderByTimestampAsc(tokenId);
    }

    // ── Active counters ───────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<Counter> getActiveCounters() {
        return counterRepository.findByIsActiveTrue();
    }

    // ── Helpers ───────────────────────────────────────────────────
    private Token getToken(Long id) {
        return tokenRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Token not found: " + id));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    private void logAction(Token token, User actor, AuditLog.Action action, String notes) {
        auditLogRepository.save(AuditLog.builder()
                .token(token)
                .actor(actor)
                .action(action)
                .notes(notes)
                .timestamp(LocalDateTime.now())
                .build());
    }

    private QueueUpdateEvent buildEvent(QueueUpdateEvent.EventType type,
                                        Token token, Counter counter) {

        // Find what's currently being served at this counter
        List<Token> serving = tokenRepository
                .findByCounterIdAndStatusOrderByIssuedAtAsc(counter.getId(), Token.Status.SERVING);
        List<Token> called = tokenRepository
                .findByCounterIdAndStatusOrderByIssuedAtAsc(counter.getId(), Token.Status.CALLED);

        String nowServing = !serving.isEmpty() ? serving.get(0).getTokenNumber()
                : !called.isEmpty()  ? called.get(0).getTokenNumber()
                : "---";

        long waiting = tokenRepository.countWaitingByCounter(counter.getId());

        return QueueUpdateEvent.builder()
                .eventType(type)
                .counterId(counter.getId())
                .counterName(counter.getName())
                .tokenNumber(token.getTokenNumber())
                .priority(token.getPriority())
                .nowServing(nowServing)
                .totalWaiting(waiting)
                .timestamp(LocalDateTime.now())
                .build();
    }
}