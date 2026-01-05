package com.RizSafProjectManager.ProjectManager.Models;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "project_document")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "original_filename", nullable = false, length = 500)
    private String originalFilename;

    @Column(name = "stored_filename", nullable = false, length = 500)
    private String storedFilename;

    @Column(name = "content_type", length = 255)
    private String contentType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private OfficeStaff uploadedBy;

    @Column(name = "uploaded_at")
    private Instant uploadedAt = Instant.now();

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = Instant.now();
        }
    }
}
