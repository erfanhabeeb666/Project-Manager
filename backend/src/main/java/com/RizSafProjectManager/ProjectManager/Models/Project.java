package com.RizSafProjectManager.ProjectManager.Models;

import com.RizSafProjectManager.ProjectManager.Enums.ProjectStage;
import com.RizSafProjectManager.ProjectManager.Enums.WorkType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "project")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100, unique = true)
    private String code;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "lsgd_name", length = 255)
    private String lsgdName;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_type", length = 100)
    private WorkType workType;

    @Column(name = "sanctioned_amount", precision = 15, scale = 2)
    private BigDecimal sanctionedAmount;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "expected_end_date")
    private LocalDate expectedEndDate;

    @Column(name = "actual_end_date")
    private LocalDate actualEndDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", length = 50, nullable = false)
    private ProjectStage stage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private OfficeStaff createdBy;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "total_expense")
    private Double totalExpense = 0.0;

    @Version
    private Long version;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("actionDate ASC, id ASC")
    private List<ProjectAction> actions = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("date DESC, createdAt DESC")
    private List<Expense> expenses = new ArrayList<>();

    // helpers
    public void addAction(ProjectAction action) {
        action.setProject(this);
        this.actions.add(action);
    }
}