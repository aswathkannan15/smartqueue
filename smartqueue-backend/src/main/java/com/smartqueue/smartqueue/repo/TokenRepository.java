package com.smartqueue.smartqueue.repo;



import com.smartqueue.smartqueue.entity.Token;
import com.smartqueue.smartqueue.entity.Token.Priority;
import com.smartqueue.smartqueue.entity.Token.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Long> {

    // Fetch next token by priority order — the core queue algorithm
    @Query("""
        SELECT t FROM Token t
        WHERE t.counter.id = :counterId AND t.status = 'WAITING'
        ORDER BY
            CASE t.priority
                WHEN 'EMERGENCY' THEN 1
                WHEN 'SENIOR'    THEN 2
                WHEN 'NORMAL'    THEN 3
            END,
            t.issuedAt ASC
        LIMIT 1
    """)
    Optional<Token> findNextToken(@Param("counterId") Long counterId);

    List<Token> findByCounterIdAndStatusOrderByIssuedAtAsc(Long counterId, Status status);

    List<Token> findByStatusOrderByPriorityAscIssuedAtAsc(Status status);

    @Query("SELECT COUNT(t) FROM Token t WHERE t.counter.id = :counterId AND t.status = 'WAITING'")
    long countWaitingByCounter(@Param("counterId") Long counterId);

    @Query("""
        SELECT t FROM Token t
        WHERE t.counter.id = :counterId
          AND t.issuedAt BETWEEN :from AND :to
        ORDER BY t.issuedAt DESC
    """)
    List<Token> findByCounterAndDateRange(@Param("counterId") Long counterId,
                                          @Param("from") LocalDateTime from,
                                          @Param("to") LocalDateTime to);

    // For token number generation — get last token of today
    @Query("""
        SELECT t FROM Token t
        WHERE DATE(t.issuedAt) = CURRENT_DATE
        ORDER BY t.id DESC
        LIMIT 1
    """)
    Optional<Token> findLastTokenToday();

    // Total tokens today by status
    @Query("""
    SELECT t.status, COUNT(t) FROM Token t
    WHERE DATE(t.issuedAt) = CURRENT_DATE
    GROUP BY t.status
""")
    List<Object[]> countTodayByStatus();

    // Tokens issued per hour today
    @Query("""
    SELECT HOUR(t.issuedAt), COUNT(t) FROM Token t
    WHERE DATE(t.issuedAt) = CURRENT_DATE
    GROUP BY HOUR(t.issuedAt)
    ORDER BY HOUR(t.issuedAt)
""")
    List<Object[]> countByHourToday();

    // Stats per counter today
    @Query("""
    SELECT t.counter.name,
           SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END),
           SUM(CASE WHEN t.status = 'SKIPPED'   THEN 1 ELSE 0 END),
           SUM(CASE WHEN t.status = 'WAITING'   THEN 1 ELSE 0 END)
    FROM Token t
    WHERE DATE(t.issuedAt) = CURRENT_DATE
    GROUP BY t.counter.name
""")
    List<Object[]> statsByCounterToday();

    // Average wait time (issued → called) in minutes for completed tokens
    @Query("""
    SELECT AVG(TIMESTAMPDIFF(MINUTE, t.issuedAt, t.calledAt))
    FROM Token t
    WHERE DATE(t.issuedAt) = CURRENT_DATE
      AND t.calledAt IS NOT NULL
""")
    Double avgWaitTimeToday();

    // Tokens by priority today
    @Query("""
    SELECT t.priority, COUNT(t) FROM Token t
    WHERE DATE(t.issuedAt) = CURRENT_DATE
    GROUP BY t.priority
""")
    List<Object[]> countByPriorityToday();

    // Per-counter avg wait time
    @Query("""
    SELECT t.counter.name,
           AVG(TIMESTAMPDIFF(MINUTE, t.issuedAt, t.calledAt))
    FROM Token t
    WHERE DATE(t.issuedAt) = CURRENT_DATE
      AND t.calledAt IS NOT NULL
    GROUP BY t.counter.name
""")
    List<Object[]> avgWaitByCounter();
}