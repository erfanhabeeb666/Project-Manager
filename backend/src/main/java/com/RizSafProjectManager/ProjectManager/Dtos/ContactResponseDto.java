package com.RizSafProjectManager.ProjectManager.Dtos;

import com.RizSafProjectManager.ProjectManager.Enums.ContactSource;
import com.RizSafProjectManager.ProjectManager.Enums.Status;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ContactResponseDto {
    private UUID id;
    private UUID lsgdId;
    private String lsgdName; // Useful for display
    private String personName;
    private String designation;
    private String department;
    private String primaryPhone;
    private String secondaryPhone;
    private String whatsappNumber;
    private String email;
    private String remarks;
    private ContactSource source;
    private boolean verified;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Status status;
}
