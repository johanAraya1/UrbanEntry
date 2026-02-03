package com.urbanentry;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UrbanEntryApplication {

    public static void main(String[] args) {
        SpringApplication.run(UrbanEntryApplication.class, args);
        System.out.println("\n" +
                "═══════════════════════════════════════════════════════\n" +
                "   🏢 UrbanEntry - Backend API Started Successfully\n" +
                "═══════════════════════════════════════════════════════\n");
    }
}
