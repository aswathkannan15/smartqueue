package com.smartqueue.smartqueue.repo;



import com.smartqueue.smartqueue.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByTokenIdOrderByTimestampAsc(Long tokenId);
    List<AuditLog> findByActorIdOrderByTimestampDesc(Long actorId);
}