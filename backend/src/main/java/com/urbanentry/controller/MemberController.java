package com.urbanentry.controller;

import com.urbanentry.dto.MemberRequest;
import com.urbanentry.entity.House;
import com.urbanentry.entity.User;
import com.urbanentry.entity.UserRole;
import com.urbanentry.repository.HouseRepository;
import com.urbanentry.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.*;

@RestController
@RequestMapping("/api/admin/members")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MemberController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HouseRepository houseRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<?> getMembers(Authentication authentication) {
        try {
            String email = authentication.getName();
            Optional<User> adminOptional = userRepository.findByEmail(email);

            if (adminOptional.isEmpty()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            User admin = adminOptional.get();
            
            // Verificar que es ADMIN
            if (admin.getRole() != UserRole.ROLE_ADMIN) {
                return ResponseEntity.status(403).body("Only house administrators can manage members");
            }

            Long houseId = admin.getHouseId();
            if (houseId == null) {
                return ResponseEntity.badRequest().body("Administrator must be assigned to a house");
            }

            // Obtener todos los miembros de la misma casa
            List<User> members = userRepository.findByHouse_IdAndRole(houseId, UserRole.ROLE_MEMBER);
            
            List<Map<String, Object>> memberList = new ArrayList<>();
            for (User member : members) {
                Map<String, Object> memberMap = new HashMap<>();
                memberMap.put("id", member.getId());
                memberMap.put("firstName", member.getFirstName());
                memberMap.put("lastName", member.getLastName());
                memberMap.put("email", member.getEmail());
                memberMap.put("createdAt", member.getCreatedAt());
                memberList.add(memberMap);
            }

            return ResponseEntity.ok(memberList);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<?> createMember(@Valid @RequestBody MemberRequest request, Authentication authentication) {
        try {
            String email = authentication.getName();
            Optional<User> adminOptional = userRepository.findByEmail(email);

            if (adminOptional.isEmpty()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            User admin = adminOptional.get();
            
            // Verificar que es ADMIN
            if (admin.getRole() != UserRole.ROLE_ADMIN) {
                return ResponseEntity.status(403).body("Only house administrators can create members");
            }

            Long houseId = admin.getHouseId();
            if (houseId == null) {
                return ResponseEntity.badRequest().body("Administrator must be assigned to a house");
            }

            // Verificar que el email no existe
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Email already exists");
            }

            // Obtener la casa
            Optional<House> houseOptional = houseRepository.findById(houseId);
            if (houseOptional.isEmpty()) {
                return ResponseEntity.badRequest().body("House not found");
            }

            // Crear el nuevo miembro
            User newMember = new User();
            newMember.setFirstName(request.getFirstName());
            newMember.setLastName(request.getLastName());
            newMember.setEmail(request.getEmail());
            newMember.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            newMember.setRole(UserRole.ROLE_MEMBER);
            newMember.setHouse(houseOptional.get());
            newMember.setMustChangePassword(true); // Forzar cambio de contraseña en primer login

            User savedMember = userRepository.save(newMember);

            Map<String, Object> response = new HashMap<>();
            response.put("id", savedMember.getId());
            response.put("firstName", savedMember.getFirstName());
            response.put("lastName", savedMember.getLastName());
            response.put("email", savedMember.getEmail());
            response.put("role", savedMember.getRole().name());
            response.put("houseId", savedMember.getHouseId());
            response.put("message", "Member created successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<?> deleteMember(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            Optional<User> adminOptional = userRepository.findByEmail(email);

            if (adminOptional.isEmpty()) {
                return ResponseEntity.status(401).body("Unauthorized");
            }

            User admin = adminOptional.get();
            
            System.out.println("DELETE REQUEST - Admin: " + admin.getEmail() + ", Role: " + admin.getRole() + ", HouseId: " + admin.getHouseId());
            
            // Verificar que es ADMIN
            if (admin.getRole() != UserRole.ROLE_ADMIN) {
                return ResponseEntity.status(403).body("Only house administrators can delete members");
            }

            Long houseId = admin.getHouseId();
            if (houseId == null) {
                return ResponseEntity.badRequest().body("Administrator must be assigned to a house");
            }

            // Buscar el miembro
            Optional<User> memberOptional = userRepository.findById(id);
            if (memberOptional.isEmpty()) {
                return ResponseEntity.status(404).body("Member not found");
            }

            User member = memberOptional.get();
            
            System.out.println("Member to delete: " + member.getEmail() + ", Role: " + member.getRole() + ", HouseId: " + member.getHouseId());

            // Verificar que el miembro pertenece a la misma casa
            if (member.getHouseId() == null) {
                return ResponseEntity.status(403).body("Member does not belong to any house");
            }
            
            if (!member.getHouseId().equals(houseId)) {
                return ResponseEntity.status(403).body("You can only delete members from your house (Your house: " + houseId + ", Member house: " + member.getHouseId() + ")");
            }

            // Verificar que es un MEMBER
            if (member.getRole() != UserRole.ROLE_MEMBER) {
                return ResponseEntity.status(403).body("You can only delete users with MEMBER role (Current role: " + member.getRole() + ")");
            }

            userRepository.delete(member);
            
            System.out.println("Member deleted successfully: " + member.getEmail());

            return ResponseEntity.ok(Map.of("message", "Member deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
