package com.RizSafProjectManager.ProjectManager.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bills")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String invoiceNumber;

    private LocalDate invoiceDate;

    private String customerName;

    @Column(columnDefinition = "TEXT")
    private String customerAddress;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "bill_id")
    private List<BillItem> items = new ArrayList<>();

    private BigDecimal taxableValue;

    private BigDecimal sgstAmount;

    private BigDecimal cgstAmount;

    private BigDecimal totalAmount;

    private BigDecimal roundOff;

    private BigDecimal grandTotal;

    private String amountInWords;

    private String pdfPath;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
