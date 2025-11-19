package com.RizSafProjectManager.ProjectManager.Dtos;

import lombok.*;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficeStaffDashboardStatsDto {
    private Long myProjectsCount;
    private Long pendingActionsCount;
    private Long completedActionsCount;
    private Double myProjectsTotalExpenses;
    private Double myProjectsTotalSanctionedAmount;
    private Map<String, Long> myProjectsByStage;
    private Long totalActionsToday;
    private Long pendingActionsToday;
}

