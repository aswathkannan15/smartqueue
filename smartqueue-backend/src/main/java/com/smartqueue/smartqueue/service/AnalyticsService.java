package com.smartqueue.smartqueue.service;



import com.smartqueue.smartqueue.dto.AnalyticsResponse;
import com.smartqueue.smartqueue.dto.AnalyticsResponse.*;
        import com.smartqueue.smartqueue.repo.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
        import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TokenRepository tokenRepository;

    @Transactional(readOnly = true)
    public AnalyticsResponse getDailyAnalytics() {

        // ── 1. Status summary ────────────────────────────────────
        Map<String, Long> statusMap = new HashMap<>();
        for (Object[] row : tokenRepository.countTodayByStatus()) {
            statusMap.put(row[0].toString(), (Long) row[1]);
        }

        long completed = statusMap.getOrDefault("COMPLETED", 0L);
        long skipped   = statusMap.getOrDefault("SKIPPED",   0L);
        long waiting   = statusMap.getOrDefault("WAITING",   0L);
        long called    = statusMap.getOrDefault("CALLED",    0L);
        long serving   = statusMap.getOrDefault("SERVING",   0L);
        long total     = statusMap.values().stream().mapToLong(Long::longValue).sum();

        // ── 2. Hourly chart data ─────────────────────────────────
        List<HourlyCount> byHour = new ArrayList<>();
        Map<Integer, Long> hourMap = new LinkedHashMap<>();

        for (Object[] row : tokenRepository.countByHourToday()) {
            hourMap.put(((Number) row[0]).intValue(), (Long) row[1]);
        }

        // Fill all 24 hours (0–23), even if count is 0
        for (int h = 0; h < 24; h++) {
            byHour.add(HourlyCount.builder()
                    .hour(h)
                    .label(formatHour(h))
                    .count(hourMap.getOrDefault(h, 0L))
                    .build());
        }

        // ── 3. Per-counter avg wait time ─────────────────────────
        Map<String, Double> counterAvgWait = new HashMap<>();
        for (Object[] row : tokenRepository.avgWaitByCounter()) {
            counterAvgWait.put(
                    (String) row[0],
                    row[1] != null ? ((Number) row[1]).doubleValue() : 0.0
            );
        }

        // ── 4. Per-counter stats ─────────────────────────────────
        List<CounterStat> counterStats = new ArrayList<>();
        for (Object[] row : tokenRepository.statsByCounterToday()) {
            String name = (String) row[0];
            counterStats.add(CounterStat.builder()
                    .counterName(name)
                    .served(((Number) row[1]).longValue())
                    .skipped(((Number) row[2]).longValue())
                    .waiting(((Number) row[3]).longValue())
                    .avgWaitMinutes(counterAvgWait.getOrDefault(name, 0.0))
                    .build());
        }

        // ── 5. Priority breakdown ─────────────────────────────────
        Map<String, Long> byPriority = new LinkedHashMap<>();
        for (Object[] row : tokenRepository.countByPriorityToday()) {
            byPriority.put(row[0].toString(), (Long) row[1]);
        }

        // ── 6. Overall avg wait ───────────────────────────────────
        Double avgWait = tokenRepository.avgWaitTimeToday();

        return AnalyticsResponse.builder()
                .totalTokensToday(total)
                .totalCompleted(completed)
                .totalSkipped(skipped)
                .currentlyWaiting(waiting + called + serving)
                .avgWaitTimeMinutes(avgWait != null ? Math.round(avgWait * 10.0) / 10.0 : 0.0)
                .tokensByHour(byHour)
                .statsByCounter(counterStats)
                .tokensByPriority(byPriority)
                .build();
    }

    // "9 AM", "2 PM", "12 PM" etc.
    private String formatHour(int h) {
        if (h == 0)  return "12 AM";
        if (h == 12) return "12 PM";
        return h < 12 ? h + " AM" : (h - 12) + " PM";
    }
}