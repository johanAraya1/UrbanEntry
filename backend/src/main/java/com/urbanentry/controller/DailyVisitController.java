package com.urbanentry.controller;

import com.urbanentry.dto.DailyVisitRequest;
import com.urbanentry.dto.DailyVisitResponse;
import com.urbanentry.entity.DailyVisit;
import com.urbanentry.entity.User;
import com.urbanentry.entity.VisitStatus;
import com.urbanentry.repository.DailyVisitRepository;
import com.urbanentry.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.text.Normalizer;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/api/visits", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
public class DailyVisitController {

    @Autowired
    private DailyVisitRepository dailyVisitRepository;

    @Autowired
    private UserRepository userRepository;

    private String normalizeText(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        // Normalize the text to ensure proper UTF-8 encoding
        return Normalizer.normalize(text.trim(), Normalizer.Form.NFC);
    }

    @GetMapping
    public ResponseEntity<List<DailyVisitResponse>> getDailyVisits(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getHouse() == null) {
            return ResponseEntity.ok(List.of());
        }

        List<DailyVisit> visits = dailyVisitRepository.findByHouseId(user.getHouse().getId());
        
        List<DailyVisitResponse> response = visits.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<DailyVisitResponse> createDailyVisit(
            @RequestBody DailyVisitRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getHouse() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        DailyVisit visit = new DailyVisit();
        visit.setVisitorName(normalizeText(request.getVisitorName()));
        visit.setDocumentType(request.getDocumentType() != null ? request.getDocumentType() : "CEDULA");
        visit.setIdNumber(normalizeText(request.getIdNumber()));
        visit.setLicensePlate(request.getLicensePlate() != null ? 
            normalizeText(request.getLicensePlate().toUpperCase()) : null);
        visit.setVisitDate(request.getVisitDate());
        visit.setExpectedTimeFrom(request.getExpectedTimeFrom());
        visit.setExpectedTimeTo(request.getExpectedTimeTo());
        visit.setStatus(VisitStatus.PENDING);
        visit.setHouse(user.getHouse());
        visit.setCreatedBy(user);

        DailyVisit saved = dailyVisitRepository.save(visit);

        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DailyVisitResponse> updateDailyVisit(
            @PathVariable Long id,
            @RequestBody DailyVisitRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        DailyVisit visit = dailyVisitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visita no encontrada"));

        // Verificar que la visita pertenece a la casa del usuario
        if (!visit.getHouse().getId().equals(user.getHouse().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        visit.setVisitorName(normalizeText(request.getVisitorName()));
        visit.setDocumentType(request.getDocumentType() != null ? request.getDocumentType() : "CEDULA");
        visit.setIdNumber(normalizeText(request.getIdNumber()));
        visit.setLicensePlate(request.getLicensePlate() != null ? 
            normalizeText(request.getLicensePlate().toUpperCase()) : null);
        visit.setVisitDate(request.getVisitDate());
        visit.setExpectedTimeFrom(request.getExpectedTimeFrom());
        visit.setExpectedTimeTo(request.getExpectedTimeTo());

        DailyVisit updated = dailyVisitRepository.save(visit);

        return ResponseEntity.ok(mapToResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDailyVisit(
            @PathVariable Long id,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        DailyVisit visit = dailyVisitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visita no encontrada"));

        // Verificar que la visita pertenece a la casa del usuario
        if (!visit.getHouse().getId().equals(user.getHouse().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Hard delete for daily visits (they are temporary)
        dailyVisitRepository.delete(visit);

        return ResponseEntity.noContent().build();
    }

    private DailyVisitResponse mapToResponse(DailyVisit visit) {
        DailyVisitResponse response = new DailyVisitResponse();
        response.setId(visit.getId());
        
        // Dividir el visitorName en firstName y lastName
        String[] nameParts = visit.getVisitorName().split(" ", 2);
        response.setFirstName(nameParts.length > 0 ? nameParts[0] : "");
        response.setDocumentType(visit.getDocumentType() != null ? visit.getDocumentType() : "CEDULA");
        response.setIdNumber(visit.getIdNumber());response.setDocumentType("CEDULA");
        response.setIdNumber("");
        
        response.setLicensePlate(visit.getLicensePlate());
        response.setVisitDate(visit.getVisitDate());
        response.setExpectedTimeFrom(visit.getExpectedTimeFrom());
        response.setExpectedTimeTo(visit.getExpectedTimeTo());
        response.setStatus(visit.getStatus());
        response.setNotes(visit.getNotes());
        response.setCreatedAt(visit.getCreatedAt());
        response.setUpdatedAt(visit.getUpdatedAt());
        
        return response;
    }
}
