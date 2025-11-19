package com.RizSafProjectManager.ProjectManager.Utils;

import com.RizSafProjectManager.ProjectManager.Dtos.*;
import com.RizSafProjectManager.ProjectManager.Enums.ActionStatus;
import com.RizSafProjectManager.ProjectManager.Enums.ProjectStage;
import com.RizSafProjectManager.ProjectManager.Enums.WorkType;
import com.RizSafProjectManager.ProjectManager.Models.Expense;
import com.RizSafProjectManager.ProjectManager.Models.Project;
import com.RizSafProjectManager.ProjectManager.Models.ProjectAction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectMapperImpl implements ProjectMapper {

    @Autowired
    private ExpenseMapperImpl expenseMapper;

    // -----------------------------
    // Project → ProjectResponseDto
    // -----------------------------
    @Override
    public ProjectResponseDto toDto(Project project) {
        if (project == null)
            return null;

        return ProjectResponseDto.builder()
                .id(project.getId())
                .code(project.getCode())
                .name(project.getName())
                .lsgdName(project.getLsgdName())
                .workType(project.getWorkType() != null ? project.getWorkType().name() : null)
                .sanctionedAmount(project.getSanctionedAmount())
                .startDate(project.getStartDate())
                .expectedEndDate(project.getExpectedEndDate())
                .actualEndDate(project.getActualEndDate())
                .stage(project.getStage() != null ? project.getStage().name() : null)
                .createdById(project.getCreatedBy() != null ? project.getCreatedBy().getName() : null)
                .createdAt(project.getCreatedAt())
                .totalExpense(project.getTotalExpense())
                .actions(actionsToDtoList(project.getActions()))
                .expenses(expensesToDtoList(project.getExpenses()))
                .build();
    }

    // -----------------------------
    // ProjectRequestDto → Project
    // -----------------------------
    @Override
    public Project toEntity(ProjectRequestDto dto) {
        if (dto == null)
            return null;

        Project project = new Project();
        project.setCode(dto.getCode());
        project.setName(dto.getName());
        project.setLsgdName(dto.getLsgdName());
        project.setSanctionedAmount(dto.getSanctionedAmount());
        project.setStartDate(dto.getStartDate());
        project.setExpectedEndDate(dto.getExpectedEndDate());

        // Convert workType string → enum
        if (dto.getWorkType() != null) {
            try {
                project.setWorkType(WorkType.valueOf(dto.getWorkType()));
            } catch (IllegalArgumentException ex) {
                project.setWorkType(null); // invalid enum name
            }
        }

        // Stage must be set separately in service (required)
        project.setStage(ProjectStage.TENDER_PREPARATION);

        return project;
    }

    // -----------------------------
    // ProjectAction → ProjectActionDto
    // -----------------------------
    @Override
    public ProjectActionDto actionToDto(ProjectAction action) {
        if (action == null)
            return null;

        return ProjectActionDto.builder()
                .id(action.getId())
                .title(action.getTitle())
                .actionDate(action.getActionDate())
                .status(action.getStatus() != null ? action.getStatus().name() : null)
                .notes(action.getNotes())
                .createdAt(action.getCreatedAt())
                .createdById(action.getCreatedBy() != null ? action.getCreatedBy().getName() : null)
                .projectId(action.getProject() != null ? action.getProject().getId() : null)
                .projectName(action.getProject() != null ? action.getProject().getName() : null)
                .projectLsgdName(action.getProject() != null ? action.getProject().getLsgdName() : null)
                .build();
    }

    // -----------------------------
    // CreateActionRequestDto → ProjectAction
    // -----------------------------
    @Override
    public ProjectAction toActionEntity(CreateActionRequestDto dto) {
        if (dto == null)
            return null;

        ProjectAction action = new ProjectAction();
        action.setTitle(dto.getTitle());
        action.setActionDate(dto.getActionDate());
        action.setNotes(dto.getNotes());
        action.setStatus(ActionStatus.PENDING); // default

        return action;
    }

    // -----------------------------
    // List<ProjectAction> → List<ProjectActionDto>
    // -----------------------------
    @Override
    public List<ProjectActionDto> actionsToDtoList(List<ProjectAction> actions) {
        if (actions == null || actions.isEmpty())
            return Collections.emptyList();
        return actions.stream()
                .map(this::actionToDto)
                .collect(Collectors.toList());
    }

    // -----------------------------
    // List<Expense> → List<ExpenseResponseDto>
    // -----------------------------
    private List<ExpenseResponseDto> expensesToDtoList(List<Expense> expenses) {
        if (expenses == null || expenses.isEmpty())
            return Collections.emptyList();
        return expenses.stream()
                .map(expenseMapper::toDto)
                .collect(Collectors.toList());
    }
}
