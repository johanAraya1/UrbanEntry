package com.urbanentry.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyVisitRequest {
    private String firstName;
    private String lastName;
    private String documentType;
    private String idNumber;
    private String licensePlate;
    private LocalDate visitDate;
    private LocalTime expectedTimeFrom;
    private LocalTime expectedTimeTo;
    
    public String getVisitorName() {
        return firstName + " " + lastName;
    }
}
