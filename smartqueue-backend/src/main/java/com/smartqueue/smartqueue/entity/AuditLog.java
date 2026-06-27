package com.smartqueue.smartqueue.entity;


import jakarta.persistence.*;
        import lombok.*;
        import java.time.LocalDateTime;

@Entity @Table(name = "audit_log")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "token_id", nullable = false)
    private Token token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Action action;

    private String notes;

    private LocalDateTime timestamp = LocalDateTime.now();

    public enum Action { ISSUED, CALLED, SERVING, COMPLETED, SKIPPED }
}