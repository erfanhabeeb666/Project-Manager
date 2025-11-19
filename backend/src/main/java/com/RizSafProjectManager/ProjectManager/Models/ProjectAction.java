package com.RizSafProjectManager.ProjectManager.Models;

import com.RizSafProjectManager.ProjectManager.Enums.ActionStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "project_action")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectAction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "action_date", nullable = false)
    private LocalDate actionDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private ActionStatus status = ActionStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private OfficeStaff createdBy;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
}
