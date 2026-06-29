package com.smartqueue.smartqueue.dto;



import lombok.*;
        import java.util.List;
import java.util.Map;

@Data @Builder
public class AnalyticsResponse {

    // Summary cards
    private long totalTokensToday;
    private long totalCompleted;
    private long totalSkipped;
    private long currentlyWaiting;
    private double avgWaitTimeMinutes;   // issued_at → called_at

    // Chart data
    private List<HourlyCount> tokensByHour;       // bar chart
    private List<CounterStat> statsByCounter;      // table
    private Map<String, Long> tokensByPriority;    // pie chart

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class HourlyCount {
        private int hour;           // 0–23
        private String label;       // "9 AM", "10 AM"
        private long count;
    }

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class CounterStat {
        private String counterName;
        private long served;
        private long skipped;
        private long waiting;
        private double avgWaitMinutes;
    }
}