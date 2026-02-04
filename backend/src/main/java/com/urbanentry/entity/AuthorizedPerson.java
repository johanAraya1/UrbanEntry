package com.urbanentry.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "authorized_persons", indexes = {
        @Index(name = "idx_authorized_house", columnList = "house_id"),
        @Index(name = "idx_authorized_plate", columnList = "license_plate"),
        @Index(name = "idx_authorized_name", columnList = "full_name")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizedPerson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "document_type", length = 50)
    private String documentType = "CEDULA";

    @Column(name = "id_card", length = 50)
    private String idCard;

    @Column(name = "license_plate", length = 20)
    private String licensePlate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "house_id", nullable = false)
    private House house;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Métodos de utilidad
    public boolean isValid() {
        if (!isActive) {
            return false;
        }
        if (validUntil == null) {
            return true; // Permanente
        }
        return !LocalDate.now().isAfter(validUntil);
    }

    public boolean isExpiringSoon() {
        if (validUntil == null) {
            return false;
        }
        LocalDate sevenDaysFromNow = LocalDate.now().plusDays(7);
        return validUntil.isBefore(sevenDaysFromNow) && validUntil.isAfter(LocalDate.now());
    }
}
