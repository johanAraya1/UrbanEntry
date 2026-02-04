package com.urbanentry.controller;

import com.urbanentry.dto.AuthorizedPersonRequest;
import com.urbanentry.dto.AuthorizedPersonResponse;
import com.urbanentry.entity.AuthorizedPerson;
import com.urbanentry.entity.User;
import com.urbanentry.repository.AuthorizedPersonRepository;
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
@RequestMapping(value = "/api/authorized", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
public class AuthorizedPersonController {

    @Autowired
    private AuthorizedPersonRepository authorizedPersonRepository;

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
    public ResponseEntity<List<AuthorizedPersonResponse>> getAuthorizedPersons(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getHouse() == null) {
            return ResponseEntity.ok(List.of());
        }

        List<AuthorizedPerson> authorizedPersons = authorizedPersonRepository.findByHouseId(user.getHouse().getId());
        
        List<AuthorizedPersonResponse> response = authorizedPersons.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<AuthorizedPersonResponse> createAuthorizedPerson(
            @RequestBody AuthorizedPersonRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (user.getHouse() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        AuthorizedPerson authorizedPerson = new AuthorizedPerson();
        authorizedPerson.setFullName(normalizeText(request.getFullName()));
        authorizedPerson.setDocumentType(request.getDocumentType() != null ? request.getDocumentType() : "CEDULA");
        authorizedPerson.setIdCard(normalizeText(request.getIdNumber()));
        authorizedPerson.setLicensePlate(request.getLicensePlate() != null ? 
            normalizeText(request.getLicensePlate().toUpperCase()) : null);
        authorizedPerson.setValidUntil(request.getValidUntil());
        authorizedPerson.setIsActive(true);
        authorizedPerson.setHouse(user.getHouse());
        authorizedPerson.setCreatedBy(user);

        AuthorizedPerson saved = authorizedPersonRepository.save(authorizedPerson);

        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuthorizedPersonResponse> updateAuthorizedPerson(
            @PathVariable Long id,
            @RequestBody AuthorizedPersonRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        AuthorizedPerson authorizedPerson = authorizedPersonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Persona autorizada no encontrada"));

        // Verificar que la persona autorizada pertenece a la casa del usuario
        if (!authorizedPerson.getHouse().getId().equals(user.getHouse().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        authorizedPerson.setFullName(normalizeText(request.getFullName()));
        authorizedPerson.setDocumentType(request.getDocumentType() != null ? request.getDocumentType() : "CEDULA");
        authorizedPerson.setIdCard(normalizeText(request.getIdNumber()));
        authorizedPerson.setLicensePlate(request.getLicensePlate() != null ? 
            normalizeText(request.getLicensePlate().toUpperCase()) : null);
        authorizedPerson.setValidUntil(request.getValidUntil());

        AuthorizedPerson updated = authorizedPersonRepository.save(authorizedPerson);

        return ResponseEntity.ok(mapToResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuthorizedPerson(
            @PathVariable Long id,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        AuthorizedPerson authorizedPerson = authorizedPersonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Persona autorizada no encontrada"));

        // Verificar que la persona autorizada pertenece a la casa del usuario
        if (!authorizedPerson.getHouse().getId().equals(user.getHouse().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Soft delete
        authorizedPerson.setIsActive(false);
        authorizedPersonRepository.save(authorizedPerson);

        return ResponseEntity.noContent().build();
    }

    private AuthorizedPersonResponse mapToResponse(AuthorizedPerson person) {
        AuthorizedPersonResponse response = new AuthorizedPersonResponse();
        response.setId(person.getId());
        
        // Dividir el fullName en firstName y lastName
        String[] nameParts = person.getFullName().split(" ", 2);
        response.setFirstName(nameParts.length > 0 ? nameParts[0] : "");
        response.setLastName(nameParts.length > 1 ? nameParts[1] : "");
        
        response.setDocumentType(person.getDocumentType() != null ? person.getDocumentType() : "CEDULA");
        response.setIdNumber(person.getIdCard());
        response.setLicensePlate(person.getLicensePlate());
        response.setValidUntil(person.getValidUntil());
        response.setIsActive(person.getIsActive());
        response.setCreatedAt(person.getCreatedAt());
        response.setUpdatedAt(person.getUpdatedAt());
        
        return response;
    }
}
