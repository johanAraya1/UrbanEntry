package com.urbanentry.dto;

import com.urbanentry.entity.VisitStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyVisitResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String documentType;
    private String idNumber;
    private String licensePlate;
    private LocalDate visitDate;
    private LocalTime expectedTimeFrom;
    private LocalTime expectedTimeTo;
    private VisitStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
