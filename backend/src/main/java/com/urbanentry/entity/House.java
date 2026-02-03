package com.urbanentry.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "houses", indexes = {
        @Index(name = "idx_houses_number", columnList = "house_number"),
        @Index(name = "idx_houses_admin", columnList = "admin_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class House {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "house_number", nullable = false, unique = true, length = 20)
    private String houseNumber;

    @Column(length = 50)
    private String section;

    @Column(length = 255)
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User admin;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Método de utilidad
    public String getFullAddress() {
        if (section != null && !section.isEmpty()) {
            return "Casa " + houseNumber + " - Sección " + section;
        }
        return "Casa " + houseNumber;
    }
}
