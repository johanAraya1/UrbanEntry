package com.urbanentry.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizedPersonRequest {
    private String firstName;
    private String lastName;
    private String documentType;
    private String idNumber;
    private String licensePlate;
    private LocalDate validUntil;
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
