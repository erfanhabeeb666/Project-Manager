package com.RizSafProjectManager.ProjectManager.Controllers;

import com.RizSafProjectManager.ProjectManager.Dtos.*;
import com.RizSafProjectManager.ProjectManager.Enums.ActionStatus;
import com.RizSafProjectManager.ProjectManager.Enums.ExpenseType;
import com.RizSafProjectManager.ProjectManager.Exception.BadRequestException;
import com.RizSafProjectManager.ProjectManager.Security.JwtService;
import com.RizSafProjectManager.ProjectManager.Security.JwtUtils;
import com.RizSafProjectManager.ProjectManager.Models.Worker;
import com.RizSafProjectManager.ProjectManager.Repos.WorkerRepository;
import com.RizSafProjectManager.ProjectManager.Services.ExpenseService;
import com.RizSafProjectManager.ProjectManager.Services.ProjectService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/office-staff")
@PreAuthorize("hasAuthority('OFFICE_STAFF')")
public class OfficeStaffController {

    private final ProjectService projectService;
    private final ExpenseService expenseService;
    private final WorkerRepository workerRepository;
    private final HttpServletRequest request;
    private final JwtUtils jwtUtils;
    private final JwtService jwtService;

    public OfficeStaffController(ProjectService projectService, ExpenseService expenseService,
            WorkerRepository workerRepository, HttpServletRequest request, JwtUtils jwtUtils, JwtService jwtService) {
        this.projectService = projectService;
        this.expenseService = expenseService;
        this.workerRepository = workerRepository;
        this.request = request;
        this.jwtUtils = jwtUtils;
        this.jwtService = jwtService;
    }

    @PostMapping("/projects")
    public ResponseEntity<ApiResponse<ProjectResponseDto>> createProject(
            @Valid @RequestBody ProjectRequestDto dto) {
        Long createdById = Long.valueOf(jwtService.extractId(jwtUtils.getJwtFromRequest(request)));
        var created = projectService.createProject(dto, createdById);
        return ResponseEntity.created(URI.create("/office-staff/projects/" + created.getId()))
                .body(ApiResponse.<ProjectResponseDto>builder().success(true).message("Project created").data(created)
                        .build());
    }

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<Page<ProjectResponseDto>>> listProjects(
            @RequestParam Optional<String> stage,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> size) {
        Pageable pageable = PageRequest.of(page.orElse(0), size.orElse(20), Sort.by("createdAt").descending());
        var pageRes = projectService.listProjects(stage, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<ProjectResponseDto>>builder().success(true)
                .message("Projects fetched").data(pageRes).build());
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<ProjectResponseDto>> getProject(@PathVariable Long id) {
        var dto = projectService.getProject(id);
        return ResponseEntity.ok(
                ApiResponse.<ProjectResponseDto>builder().success(true).message("Project fetched").data(dto).build());
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<ProjectResponseDto>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequestDto dto) {
        Long updatedById = Long.valueOf(jwtService.extractId(jwtUtils.getJwtFromRequest(request)));
        var updated = projectService.updateProject(id, dto, updatedById);
        return ResponseEntity.ok(ApiResponse.<ProjectResponseDto>builder().success(true).message("Project updated")
                .data(updated).build());
    }

    @PutMapping("/projects/{id}/stage")
    public ResponseEntity<ApiResponse<ProjectResponseDto>> changeStage(
            @PathVariable Long id,
            @Valid @RequestBody ChangeStageRequestDto dto) {
        Long changedById = Long.valueOf(jwtService.extractId(jwtUtils.getJwtFromRequest(request)));
        var updated = projectService.changeStage(id, dto, changedById);
        return ResponseEntity.ok(
                ApiResponse.<ProjectResponseDto>builder().success(true).message("Stage changed").data(updated).build());
    }

    @PostMapping("/projects/{id}/actions")
    public ResponseEntity<ApiResponse<ProjectActionDto>> addAction(
            @PathVariable Long id,
            @Valid @RequestBody CreateActionRequestDto dto) {
        Long createdById = Long.valueOf(jwtService.extractId(jwtUtils.getJwtFromRequest(request)));
        var action = projectService.addAction(id, dto, createdById);
        return ResponseEntity.created(URI.create("/office-staff/projects/" + id + "/actions/" + action.getId()))
                .body(ApiResponse.<ProjectActionDto>builder().success(true).message("Action added").data(action)
                        .build());
    }

    @PutMapping("/projects/{projectId}/actions/{actionId}")
    public ResponseEntity<ApiResponse<ProjectActionDto>> updateActionStatus(
            @PathVariable Long projectId,
            @PathVariable Long actionId,
            @RequestParam ActionStatus status) {
        Long updaterId = Long.valueOf(jwtService.extractId(jwtUtils.getJwtFromRequest(request)));
        var action = projectService.updateActionStatus(projectId, actionId, status, updaterId);
        return ResponseEntity.ok(
                ApiResponse.<ProjectActionDto>builder().success(true).message("Action updated").data(action).build());
    }

    @GetMapping("/actions")
    public ResponseEntity<ApiResponse<List<ProjectActionDto>>> getActionsByDate(
            @RequestParam Optional<String> date,
            @RequestParam Optional<String> fromDate,
            @RequestParam Optional<String> toDate) {

        List<ProjectActionDto> actions;

        // If both fromDate and toDate are provided, use date range
        if (fromDate.isPresent() && toDate.isPresent()) {
            LocalDate from = LocalDate.parse(fromDate.get());
            LocalDate to = LocalDate.parse(toDate.get());
            actions = projectService.findActionsBetween(from, to);
        }
        // If only date is provided (for backward compatibility), use single date
        else if (date.isPresent()) {
            LocalDate d = LocalDate.parse(date.get());
            actions = projectService.findActionsByDate(d);
        }
        // Default to today if no parameters provided
        else {
            LocalDate today = LocalDate.now();
            actions = projectService.findActionsByDate(today);
        }

        return ResponseEntity.ok(ApiResponse.<List<ProjectActionDto>>builder()
                .success(true).message("Actions fetched").data(actions).build());
    }

    // Note: /office-staff/actions/today already implemented, but for clarity:
    @GetMapping("/actions/today")
    public ResponseEntity<ApiResponse<List<ProjectActionDto>>> todaysActions() {
        LocalDate today = LocalDate.now();
        var actions = projectService.findActionsByDate(today);
        return ResponseEntity.ok(ApiResponse.<List<ProjectActionDto>>builder()
                .success(true).message("Today's actions").data(actions).build());
    }

    @PostMapping("/expenses")
    public ResponseEntity<ApiResponse<ExpenseResponseDto>> createExpense(
            @Valid @RequestBody ExpenseRequestDto dto) {
        Long createdById = Long.valueOf(jwtService.extractId(jwtUtils.getJwtFromRequest(request)));
        var created = expenseService.createExpense(dto, createdById);
        return ResponseEntity.created(URI.create("/office-staff/expenses/" + created.getId()))
                .body(ApiResponse.<ExpenseResponseDto>builder()
                        .success(true)
                        .message("Expense created")
                        .data(created)
                        .build());
    }

    @GetMapping("/expenses")
    public ResponseEntity<ApiResponse<Page<ExpenseResponseDto>>> listExpenses(
            @RequestParam Optional<Long> projectId,
            @RequestParam Optional<String> type,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> size) {
        Pageable pageable = PageRequest.of(page.orElse(0), size.orElse(20),
                Sort.by("createdAt").descending());

        Optional<ExpenseType> expenseType = type.map(t -> {
            try {
                return ExpenseType.valueOf(t.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid expense type: " + t);
            }
        });

        var pageRes = expenseService.listExpenses(projectId, expenseType, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<ExpenseResponseDto>>builder()
                .success(true)
                .message("Expenses fetched")
                .data(pageRes)
                .build());
    }

    @GetMapping("/expenses/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponseDto>> getExpense(@PathVariable Long id) {
        var dto = expenseService.getExpense(id);
        return ResponseEntity.ok(ApiResponse.<ExpenseResponseDto>builder()
                .success(true)
                .message("Expense fetched")
                .data(dto)
                .build());
    }

    @GetMapping("/workers")
    public ResponseEntity<ApiResponse<List<WorkerResponseDto>>> listWorkers() {
        List<Worker> workers = workerRepository.findAll();
        List<WorkerResponseDto> workerDtos = workers.stream()
                .map(worker -> WorkerResponseDto.builder()
                        .id(worker.getId())
                        .name(worker.getName())
                        .adharUid(worker.getAdharUid())
                        .mobileNumber(worker.getMobileNumber())
                        .status(worker.getStatus())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.<List<WorkerResponseDto>>builder()
                .success(true)
                .message("Workers fetched")
                .data(workerDtos)
                .build());
    }
}
