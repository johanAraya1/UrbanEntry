package com.urbanentry.controller;

import com.urbanentry.entity.User;
import com.urbanentry.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping(value = "/users", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> userList = new ArrayList<>();
        
        for (User user : users) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("firstName", user.getFirstName());
            userMap.put("lastName", user.getLastName());
            userMap.put("email", user.getEmail());
            userMap.put("role", user.getRole().name());
            
            // Show raw bytes for debugging
            if (user.getLastName() != null) {
                userMap.put("lastNameHex", bytesToHex(user.getLastName().getBytes(StandardCharsets.UTF_8)));
            }
            
            userList.add(userMap);
        }
        
        return ResponseEntity.ok(userList);
    }
    
    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02X ", b));
        }
        return sb.toString().trim();
    }

    @PostMapping(value = "/fix-encoding", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<?> fixEncoding() {
        try {
            List<User> users = userRepository.findAll();
            int fixed = 0;
            
            for (User user : users) {
                boolean changed = false;
                
                // Fix specific known names with encoding issues
                if (user.getLastName() != null) {
                    String lastName = user.getLastName();
                    if (lastName.contains("P") && lastName.contains("rez") && !lastName.equals("Pérez")) {
                        user.setLastName("Pérez");
                        changed = true;
                    } else if (lastName.contains("Garc") && lastName.contains("a") && !lastName.equals("García")) {
                        user.setLastName("García");
                        changed = true;
                    } else if (lastName.contains("L") && lastName.contains("pez") && !lastName.equals("López")) {
                        user.setLastName("López");
                        changed = true;
                    } else if (lastName.contains("Jim") && lastName.contains("nez") && !lastName.equals("Jiménez")) {
                        user.setLastName("Jiménez");
                        changed = true;
                    } else if (lastName.contains("M") && lastName.contains("ndez") && !lastName.equals("Méndez")) {
                        user.setLastName("Méndez");
                        changed = true;
                    } else if (lastName.contains("Hern") && lastName.contains("ndez") && !lastName.equals("Hernández")) {
                        user.setLastName("Hernández");
                        changed = true;
                    } else if (lastName.contains("Ram") && lastName.contains("rez") && !lastName.equals("Ramírez")) {
                        user.setLastName("Ramírez");
                        changed = true;
                    } else if (lastName.contains("S") && lastName.contains("nchez") && !lastName.equals("Sánchez")) {
                        user.setLastName("Sánchez");
                        changed = true;
                    } else if (lastName.contains("Quesada")) {
                        user.setLastName("Quesada");
                        changed = true;
                    }
                }
                
                if (user.getFirstName() != null) {
                    String firstName = user.getFirstName();
                    if (firstName.contains("Mar") && firstName.contains("a") && !firstName.equals("María")) {
                        user.setFirstName("María");
                        changed = true;
                    } else if (firstName.contains("Jos") && !firstName.equals("José") && !firstName.equals("Juan")) {
                        user.setFirstName("José");
                        changed = true;
                    } else if (firstName.contains("Andr") && firstName.contains("s") && !firstName.equals("Andrés")) {
                        user.setFirstName("Andrés");
                        changed = true;
                    }
                }
                
                if (changed) {
                    userRepository.save(user);
                    fixed++;
                }
            }
            
            return ResponseEntity.ok("Fixed " + fixed + " users");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
