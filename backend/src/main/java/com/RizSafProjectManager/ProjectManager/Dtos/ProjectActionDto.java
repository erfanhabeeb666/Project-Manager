package com.RizSafProjectManager.ProjectManager.Dtos;

import lombok.*;
import java.time.LocalDate;
import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectActionDto {
    private Long id;
    private String title;
    private LocalDate actionDate;
    private String status;
    private String notes;
    private Long createdById;
    private Instant createdAt;
}