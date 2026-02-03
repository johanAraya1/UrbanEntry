package com.urbanentry.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "access_logs", indexes = {
        @Index(name = "idx_logs_time", columnList = "access_time"),
        @Index(name = "idx_logs_house", columnList = "house_id"),
        @Index(name = "idx_logs_visit", columnList = "visit_id"),
        @Index(name = "idx_logs_officer", columnList = "confirmed_by")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id")
    private DailyVisit visit;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_type", nullable = false, length = 20)
    private AccessType accessType;

    @Column(name = "person_name", nullable = false, length = 255)
    private String personName;

    @Column(name = "license_plate", length = 20)
    private String licensePlate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "house_id", nullable = false)
    private House house;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "confirmed_by", nullable = false)
    private User confirmedBy;

    @CreationTimestamp
    @Column(name = "access_time", nullable = false, updatable = false)
    private LocalDateTime accessTime;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Método de utilidad
    public String getAccessSummary() {
        return accessType + " - " + personName + 
               (licensePlate != null ? " (" + licensePlate + ")" : "") +
               " a " + house.getFullAddress();
    }
}
