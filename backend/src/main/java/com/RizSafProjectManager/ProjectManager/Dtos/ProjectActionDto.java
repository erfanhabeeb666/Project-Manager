package com.RizSafProjectManager.ProjectManager.Dtos;

import lombok.*;
import java.time.LocalDate;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectActionDto {
    private Long id;
    private String title;
    private LocalDate actionDate;
    private String status;
    private String notes;
    private String createdById;
    private Instant createdAt;
    private Long projectId;
    private String projectName;
    private String projectLsgdName;
}