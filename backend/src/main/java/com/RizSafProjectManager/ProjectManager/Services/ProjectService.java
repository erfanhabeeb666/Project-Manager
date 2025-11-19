package com.RizSafProjectManager.ProjectManager.Services;

import com.RizSafProjectManager.ProjectManager.Dtos.*;
import com.RizSafProjectManager.ProjectManager.Enums.ActionStatus;
import com.RizSafProjectManager.ProjectManager.Enums.ActionType;
import com.RizSafProjectManager.ProjectManager.Enums.ProjectStage;
import com.RizSafProjectManager.ProjectManager.Enums.WorkType;
import com.RizSafProjectManager.ProjectManager.Exception.BadRequestException;
import com.RizSafProjectManager.ProjectManager.Exception.NotFoundException;
import com.RizSafProjectManager.ProjectManager.Models.Project;
import com.RizSafProjectManager.ProjectManager.Models.ProjectAction;
import com.RizSafProjectManager.ProjectManager.Repos.OfficeStaffRepository;
import com.RizSafProjectManager.ProjectManager.Repos.ProjectActionRepository;
import com.RizSafProjectManager.ProjectManager.Repos.ProjectRepository;
import com.RizSafProjectManager.ProjectManager.Utils.ProjectMapperImpl;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectActionRepository actionRepository;
    private final OfficeStaffRepository staffUserRepository;
    private final ProjectMapperImpl mapper;

    public ProjectService(ProjectRepository projectRepository,
            ProjectActionRepository actionRepository,
            OfficeStaffRepository staffUserRepository, ProjectMapperImpl mapper) {
        this.projectRepository = projectRepository;
        this.actionRepository = actionRepository;
        this.staffUserRepository = staffUserRepository;
        this.mapper = mapper;
    }

    @Transactional
    public ProjectResponseDto createProject(ProjectRequestDto dto, Long createdById) {
        var user = staffUserRepository.findById(createdById)
                .orElseThrow(() -> new NotFoundException("Staff user not found: " + createdById));
        Project project = mapper.toEntity(dto);
        project.setStage(ProjectStage.TENDER_PREPARATION);
        project.setCreatedBy(user);
        Project saved = projectRepository.save(project);
        return mapper.toDto(saved);
    }

    public Page<ProjectResponseDto> listProjects(Optional<String> stageOpt, Pageable pageable) {
        Page<Project> page;
        if (stageOpt.isPresent()) {
            ProjectStage stage;
            try {
                stage = ProjectStage.valueOf(stageOpt.get());
            } catch (Exception e) {
                throw new BadRequestException("Invalid stage: " + stageOpt.get());
            }
            page = projectRepository.findAllByStage(stage, pageable);
        } else {
            page = projectRepository.findAll(pageable);
        }
        return page.map(mapper::toDto);
    }

    public ProjectResponseDto getProject(Long id) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project not found: " + id));
        return mapper.toDto(p);
    }

    @Transactional
    public ProjectResponseDto updateProject(Long id, ProjectRequestDto dto, Long updatedById) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project not found: " + id));
        // update allowed fields
        if (dto.getName() != null)
            p.setName(dto.getName());
        if (dto.getLsgdName() != null)
            p.setLsgdName(dto.getLsgdName());
        if (dto.getWorkType() != null)
            p.setWorkType(WorkType.valueOf(dto.getWorkType()));
        if (dto.getSanctionedAmount() != null)
            p.setSanctionedAmount(dto.getSanctionedAmount());
        if (dto.getStartDate() != null)
            p.setStartDate(dto.getStartDate());
        if (dto.getExpectedEndDate() != null)
            p.setExpectedEndDate(dto.getExpectedEndDate());
        Project saved = projectRepository.save(p);
        return mapper.toDto(saved);
    }

    @Transactional
    public ProjectActionDto addAction(Long projectId, CreateActionRequestDto dto, Long createdById) {
        Project p = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));
        ProjectAction action = mapper.toActionEntity(dto);
        var user = staffUserRepository.findById(createdById)
                .orElseThrow(() -> new NotFoundException("Staff user not found: " + createdById));
        action.setCreatedBy(user);
        action.setProject(p);
        action.setStatus(ActionStatus.PENDING);
        ProjectAction saved = actionRepository.save(action);
        p.getActions().add(saved); // keep in-memory consistent
        projectRepository.save(p);
        return mapper.actionToDto(saved);
    }

    @Transactional
    public ProjectActionDto updateActionStatus(Long projectId, Long actionId, ActionStatus newStatus,
            Long updatedById) {
        ProjectAction action = actionRepository.findById(actionId)
                .orElseThrow(() -> new NotFoundException("Action not found: " + actionId));
        if (!action.getProject().getId().equals(projectId)) {
            throw new BadRequestException("Action does not belong to project");
        }
        action.setStatus(newStatus);
        // Optionally update createdBy or keep createdBy as original creator. We'll keep
        // createdBy unchanged.
        ProjectAction saved = actionRepository.save(action);
        return mapper.actionToDto(saved);
    }

    @Transactional
    public ProjectResponseDto changeStage(Long projectId, ChangeStageRequestDto dto, Long changedById) {
        Project p = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));
        ProjectStage target;
        try {
            target = ProjectStage.valueOf(dto.getStage());
        } catch (Exception e) {
            throw new BadRequestException("Invalid stage: " + dto.getStage());
        }

        if (p.getStage() == ProjectStage.PROJECT_CLOSED) {
            throw new BadRequestException("Cannot change stage of a closed project");
        }

        ProjectStage oldStage = p.getStage();
        p.setStage(target);

        // Always create an action when stage changes
        var user = staffUserRepository.findById(changedById).orElse(null);
        String actionTitle = "Stage changed from " + oldStage.name() + " to " + target.name();
        ProjectAction stageAction = ProjectAction.builder()
                .project(p)
                .title(actionTitle)
                .actionType(ActionType.STAGE_CHANGE)
                .actionDate(java.time.LocalDate.now())
                .notes(dto.getNotes() != null && !dto.getNotes().isBlank() ? dto.getNotes() : null)
                .status(ActionStatus.COMPLETED)
                .createdBy(user)
                .build();
        p.getActions().add(stageAction);
        if(target.equals(ProjectStage.PROJECT_CLOSED)){
            p.setActualEndDate(java.time.LocalDate.now());
        }
        Project saved = projectRepository.save(p);
        return mapper.toDto(saved);
    }

    public List<ProjectActionDto> findActionsByDate(LocalDate date) {
        var actions = actionRepository.findByActionDateWithProject(date);
        return actions.stream().map(mapper::actionToDto).toList();
    }

    public List<ProjectActionDto> findAllActions() {
        var actions = actionRepository.findAll();
        return actions.stream().map(mapper::actionToDto).toList();
    }

    // optional: range query
    public List<ProjectActionDto> findActionsBetween(LocalDate from, LocalDate to) {
        var actions = actionRepository.findByActionDateBetweenWithProject(from, to);
        return actions.stream().map(mapper::actionToDto).toList();
    }

    public OfficeStaffDashboardStatsDto getOfficeStaffDashboardStats(Long staffId) {
        var myProjects = projectRepository.findAll().stream()
                .filter(p -> p.getCreatedBy() != null && p.getCreatedBy().getId().equals(staffId))
                .toList();
        
        long myProjectsCount = myProjects.size();
        
        var allMyActions = myProjects.stream()
                .flatMap(p -> p.getActions().stream())
                .filter(a -> a.getActionType() != ActionType.STAGE_CHANGE)
                .toList();
        
        long pendingActionsCount = allMyActions.stream()
                .filter(a -> a.getStatus() == ActionStatus.PENDING)
                .count();
        
        long completedActionsCount = allMyActions.stream()
                .filter(a -> a.getStatus() == ActionStatus.COMPLETED)
                .count();
        
        double myProjectsTotalExpenses = myProjects.stream()
                .mapToDouble(p -> p.getTotalExpense() != null ? p.getTotalExpense() : 0.0)
                .sum();
        
        double myProjectsTotalSanctionedAmount = myProjects.stream()
                .mapToDouble(p -> p.getSanctionedAmount() != null ? 
                        p.getSanctionedAmount().doubleValue() : 0.0)
                .sum();
        
        Map<String, Long> myProjectsByStage = myProjects.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getStage() != null ? p.getStage().name() : "UNKNOWN",
                        Collectors.counting()
                ));
        
        LocalDate today = LocalDate.now();
        var todayActions = actionRepository.findByActionDateWithProject(today);
        long totalActionsToday = todayActions.stream()
                .filter(a -> a.getActionType() != ActionType.STAGE_CHANGE)
                .count();
        long pendingActionsToday = todayActions.stream()
                .filter(a -> a.getActionType() != ActionType.STAGE_CHANGE && 
                            a.getStatus() == ActionStatus.PENDING)
                .count();
        
        return OfficeStaffDashboardStatsDto.builder()
                .myProjectsCount(myProjectsCount)
                .pendingActionsCount(pendingActionsCount)
                .completedActionsCount(completedActionsCount)
                .myProjectsTotalExpenses(myProjectsTotalExpenses)
                .myProjectsTotalSanctionedAmount(myProjectsTotalSanctionedAmount)
                .myProjectsByStage(myProjectsByStage)
                .totalActionsToday(totalActionsToday)
                .pendingActionsToday(pendingActionsToday)
                .build();
    }

}