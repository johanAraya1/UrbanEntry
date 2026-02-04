package com.urbanentry.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "daily_visits", indexes = {
        @Index(name = "idx_visits_date", columnList = "visit_date"),
        @Index(name = "idx_visits_house", columnList = "house_id"),
        @Index(name = "idx_visits_status", columnList = "status"),
        @Index(name = "idx_visits_plate", columnList = "license_plate")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "visitor_name", nullable = false, length = 255)
    private String visitorName;

    @Column(name = "document_type", length = 50)
    private String documentType;

    @Column(name = "id_number", length = 50)
    private String idNumber;

    @Column(name = "license_plate", length = 20)
    private String licensePlate;

    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(name = "expected_time_from")
    private LocalTime expectedTimeFrom;

    @Column(name = "expected_time_to")
    private LocalTime expectedTimeTo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VisitStatus status = VisitStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "house_id", nullable = false)
    private House house;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Métodos de utilidad
    public boolean isPending() {
        return status == VisitStatus.PENDING;
    }

    public boolean isExpired() {
        return visitDate.isBefore(LocalDate.now()) && status == VisitStatus.PENDING;
    }

    public boolean isToday() {
        return visitDate.equals(LocalDate.now());
    }

    public String getExpectedTimeRange() {
        if (expectedTimeFrom != null && expectedTimeTo != null) {
            return expectedTimeFrom + " - " + expectedTimeTo;
        } else if (expectedTimeFrom != null) {
            return "Desde " + expectedTimeFrom;
        } else if (expectedTimeTo != null) {
            return "Hasta " + expectedTimeTo;
        }
        return "Todo el día";
    }
}
