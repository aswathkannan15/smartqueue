package com.smartqueue.smartqueue.controller;



import com.smartqueue.smartqueue.dto.AnalyticsResponse;
import com.smartqueue.smartqueue.entity.Counter;
import com.smartqueue.smartqueue.repo.CounterRepository;
import com.smartqueue.smartqueue.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

        import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final CounterRepository counterRepository;
    private final AnalyticsService analyticsService;

    @GetMapping("/counters")
    public ResponseEntity<List<Counter>> getAllCounters() {
        return ResponseEntity.ok(counterRepository.findAll());
    }

    @PostMapping("/counters")
    public ResponseEntity<Counter> createCounter(@RequestBody Counter counter) {
        return ResponseEntity.ok(counterRepository.save(counter));
    }

    @PutMapping("/counters/{id}/toggle")
    public ResponseEntity<Counter> toggleCounter(@PathVariable Long id) {
        Counter counter = counterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Counter not found"));
        counter.setIsActive(!counter.getIsActive());
        return ResponseEntity.ok(counterRepository.save(counter));
    }

    @GetMapping("/analytics/daily")
    public ResponseEntity<AnalyticsResponse> getDailyAnalytics() {
        return ResponseEntity.ok(analyticsService.getDailyAnalytics());
    }
}