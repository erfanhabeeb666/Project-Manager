package com.RizSafProjectManager.ProjectManager.Models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "bill_items")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BillItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private Integer quantity;
    private BigDecimal rate;
    private BigDecimal amount; // quantity * rate
}
