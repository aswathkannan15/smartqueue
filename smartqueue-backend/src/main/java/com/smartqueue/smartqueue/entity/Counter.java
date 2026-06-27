package com.smartqueue.smartqueue.entity;


import jakarta.persistence.*;
        import lombok.*;
        import java.time.LocalDateTime;

@Entity @Table(name = "counters")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Counter {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    private String location;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}