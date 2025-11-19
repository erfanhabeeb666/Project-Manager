package com.RizSafProjectManager.ProjectManager.Models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "expense_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExpenseItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "particular", length = 500)
    private String particular;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "rate")
    private Double rate;

    @Column(name = "amount")
    private Double amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    private Expense expense;
}

