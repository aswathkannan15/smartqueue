package com.smartqueue.smartqueue.repo;



import com.smartqueue.smartqueue.entity.Counter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CounterRepository extends JpaRepository<Counter, Long> {
    List<Counter> findByIsActiveTrue();
}

