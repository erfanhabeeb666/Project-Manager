package com.RizSafProjectManager.ProjectManager.Dtos;

import com.RizSafProjectManager.ProjectManager.Enums.ContactSource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ContactRequestDto {
    @NotBlank(message = "Person Name is required")
    private String personName;

    private String designation;
    private String department;

    @NotBlank(message = "Primary Phone is required")
    private String primaryPhone;

    private String secondaryPhone;
    private String whatsappNumber;
    private String email;
    private String remarks;

    @NotNull(message = "Source is required")
    private ContactSource source;

    private boolean verified;
}
