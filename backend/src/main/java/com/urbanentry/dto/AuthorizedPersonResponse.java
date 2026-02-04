package com.urbanentry.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizedPersonResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String documentType;
    private String idNumber;
    private String licensePlate;
    private LocalDate validUntil;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
