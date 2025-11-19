package com.RizSafProjectManager.ProjectManager.Dtos;

import lombok.*;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private Long totalProjects;
    private Long totalOfficeStaff;
    private Long totalWorkers;
    private Long totalActions;
    private Long pendingActions;
    private Long completedActions;
    private Double totalExpenses;
    private Double totalSanctionedAmount;
    private Map<String, Long> projectsByStage;
    private Map<String, Long> projectsByWorkType;
    private Long totalExpensesCount;
    private Long visitExpensesCount;
    private Long materialExpensesCount;
}

