package com.RizSafProjectManager.ProjectManager.Dtos;

import com.RizSafProjectManager.ProjectManager.Enums.Status;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerResponseDto {
    private Long id;
    private String name;
    private String adharUid;
    private String mobileNumber;
    private Status status;
}

