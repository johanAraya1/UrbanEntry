package com.urbanentry.entity;

public enum VisitStatus {
    PENDING,      // Pendiente de ingreso
    CONFIRMED,    // Ingreso confirmado
    CANCELLED,    // Cancelada por residente
    EXPIRED       // Expirada (fecha pasada)
}
