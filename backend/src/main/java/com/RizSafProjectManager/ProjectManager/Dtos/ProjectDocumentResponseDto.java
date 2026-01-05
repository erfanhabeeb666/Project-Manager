package com.RizSafProjectManager.ProjectManager.Dtos;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDocumentResponseDto {
    private Long id;
    private String title;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private String description;
    private Long projectId;
    private String projectName;
    private Long uploadedById;
    private String uploadedByName;
    private Instant uploadedAt;
    private String downloadUrl;
}
