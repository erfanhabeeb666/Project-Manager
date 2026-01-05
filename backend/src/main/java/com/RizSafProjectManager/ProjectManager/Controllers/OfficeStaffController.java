package com.RizSafProjectManager.ProjectManager.Controllers;

import com.RizSafProjectManager.ProjectManager.Dtos.*;
import com.RizSafProjectManager.ProjectManager.Dtos.OfficeStaffDashboardStatsDto;
import com.RizSafProjectManager.ProjectManager.Enums.ActionStatus;
import com.RizSafProjectManager.ProjectManager.Enums.ExpenseType;
import com.RizSafProjectManager.ProjectManager.Exception.BadRequestException;
import com.RizSafProjectManager.ProjectManager.Security.JwtService;
import com.RizSafProjectManager.ProjectManager.Security.JwtUtils;
import com.RizSafProjectManager.ProjectManager.Models.Worker;
import com.RizSafProjectManager.ProjectManager.Repos.WorkerRepository;
import com.RizSafProjectManager.ProjectManager.Services.ExpenseService;
import com.RizSafProjectManager.ProjectManager.Services.ProjectService;
import com.RizSafProjectManager.ProjectManager.Services.ProjectDocumentService;
import com.RizSafProjectManager.ProjectManager.Services.SiteLocationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
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
        private final ProjectDocumentService documentService;
        private final SiteLocationService siteLocationService;
        private final HttpServletRequest request;
        private final JwtUtils jwtUtils;
        private final JwtService jwtService;

        public OfficeStaffController(ProjectService projectService, ExpenseService expenseService,
                        WorkerRepository workerRepository, ProjectDocumentService documentService,
                        SiteLocationService siteLocationService,
                        HttpServletRequest request, JwtUtils jwtUtils, JwtService jwtService) {
                this.projectService = projectService;
                this.expenseService = expenseService;
                this.workerRepository = workerRepository;
                this.documentService = documentService;
                this.siteLocationService = siteLocationService;
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
                                .body(ApiResponse.<ProjectResponseDto>builder().success(true).message("Project created")
                                                .data(created)
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
                                ApiResponse.<ProjectResponseDto>builder().success(true).message("Project fetched")
                                                .data(dto).build());
        }

        @PutMapping("/projects/{id}")
        public ResponseEntity<ApiResponse<ProjectResponseDto>> updateProject(
                        @PathVariable Long id,
                        @Valid @RequestBody ProjectRequestDto dto) {
                Long updatedById = Long.valueOf(jwtService.extractId(jwtUtils.getJwtFromRequest(request)));
                var updated = projectService.updateProject(id, dto, updatedById);
                return ResponseEntity
                                .ok(ApiResponse.<ProjectResponseDto>builder().success(true).message("Project updated")
                                                .data(updated).build());
        }

        @PutMapping("/projects/{id}/stage")
        public ResponseEntity<ApiResponse<ProjectResponseDto>> changeStage(
                        @PathVariable Long id,
                        @Valid @RequestBody ChangeStageRequestDto dto) {
                Long changedById = Long.valueOf(jwtService.extractId(jwtUtils.getJwtFromRequest(request)));
                var updated = projectService.changeStage(id, dto, changedById);
                return ResponseEntity.ok(
                                ApiResponse.<ProjectResponseDto>builder().success(true).message("Stage changed")
                                                .data(updated).build());
        }

        @PostMapping("/projects/{id}/actions")
        public ResponseEntity<ApiResponse<ProjectActionDto>> addAction(
                        @PathVariable Long id,
                        @Valid @RequestBody CreateActionRequestDto dto) {
                Long createdById = Long.valueOf(jwtService.extractId(jwtUtils.getJwtFromRequest(request)));
                var action = projectService.addAction(id, dto, createdById);
                return ResponseEntity.created(URI.create("/office-staff/projects/" + id + "/actions/" + action.getId()))
                                .body(ApiResponse.<ProjectActionDto>builder().success(true).message("Action added")
                                                .data(action)
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
                                ApiResponse.<ProjectActionDto>builder().success(true).message("Action updated")
                                                .data(action).build());
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

        @GetMapping("/dashboard/stats")
        public ResponseEntity<ApiResponse<OfficeStaffDashboardStatsDto>> getDashboardStats() {
                Long staffId = Long.valueOf(jwtService.extractId(jwtUtils.getJwtFromRequest(request)));
                var stats = projectService.getOfficeStaffDashboardStats(staffId);
                return ResponseEntity.ok(ApiResponse.<OfficeStaffDashboardStatsDto>builder()
                                .success(true)
                                .message("Dashboard statistics fetched")
                                .data(stats)
                                .build());
        }

        // Document Management Endpoints

        @PostMapping(value = "/projects/{projectId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<ProjectDocumentResponseDto>> uploadDocument(
                        @PathVariable Long projectId,
                        @RequestParam("file") MultipartFile file,
                        @RequestParam(value = "title", required = false) String title,
                        @RequestParam(value = "description", required = false) String description) {
                Long uploaderId = Long.valueOf(jwtService.extractId(jwtUtils.getJwtFromRequest(request)));
                var document = documentService.uploadDocument(projectId, title, description, file, uploaderId);
                return ResponseEntity.created(URI.create("/office-staff/documents/" + document.getId()))
                                .body(ApiResponse.<ProjectDocumentResponseDto>builder()
                                                .success(true)
                                                .message("Document uploaded successfully")
                                                .data(document)
                                                .build());
        }

        @GetMapping("/projects/{projectId}/documents")
        public ResponseEntity<ApiResponse<List<ProjectDocumentResponseDto>>> getProjectDocuments(
                        @PathVariable Long projectId,
                        @RequestParam(value = "search", required = false) String searchTerm) {
                List<ProjectDocumentResponseDto> documents;
                if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                        documents = documentService.searchDocuments(projectId, searchTerm);
                } else {
                        documents = documentService.getDocumentsByProject(projectId);
                }
                return ResponseEntity.ok(ApiResponse.<List<ProjectDocumentResponseDto>>builder()
                                .success(true)
                                .message("Documents fetched")
                                .data(documents)
                                .build());
        }

        @GetMapping("/documents/search")
        public ResponseEntity<ApiResponse<List<ProjectDocumentResponseDto>>> searchDocumentsGlobal(
                        @RequestParam(value = "q", required = false) String searchTerm,
                        @RequestParam(value = "projectId", required = false) Long projectId) {
                var documents = documentService.searchDocuments(projectId, searchTerm);
                return ResponseEntity.ok(ApiResponse.<List<ProjectDocumentResponseDto>>builder()
                                .success(true)
                                .message("Documents searched")
                                .data(documents)
                                .build());
        }

        @GetMapping("/documents/{documentId}")
        public ResponseEntity<ApiResponse<ProjectDocumentResponseDto>> getDocument(@PathVariable Long documentId) {
                var document = documentService.getDocument(documentId);
                return ResponseEntity.ok(ApiResponse.<ProjectDocumentResponseDto>builder()
                                .success(true)
                                .message("Document fetched")
                                .data(document)
                                .build());
        }

        @GetMapping("/documents/{documentId}/download")
        public ResponseEntity<Resource> downloadDocument(@PathVariable Long documentId) {
                Resource resource = documentService.downloadDocument(documentId);
                String filename = documentService.getOriginalFilename(documentId);
                String contentType = documentService.getContentType(documentId);

                return ResponseEntity.ok()
                                .contentType(MediaType.parseMediaType(
                                                contentType != null ? contentType : "application/octet-stream"))
                                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                                .body(resource);
        }

        @DeleteMapping("/documents/{documentId}")
        public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long documentId) {
                documentService.deleteDocument(documentId);
                return ResponseEntity.ok(ApiResponse.<Void>builder()
                                .success(true)
                                .message("Document deleted successfully")
                                .build());
        }

        // Site Location Endpoints

        @PostMapping("/projects/{projectId}/locations")
        public ResponseEntity<ApiResponse<SiteLocationResponseDto>> createLocation(
                        @PathVariable Long projectId,
                        @Valid @RequestBody SiteLocationRequestDto dto) {
                var location = siteLocationService.createLocation(projectId, dto);
                return ResponseEntity.created(
                                URI.create("/office-staff/projects/" + projectId + "/locations/" + location.getId()))
                                .body(ApiResponse.<SiteLocationResponseDto>builder()
                                                .success(true)
                                                .message("Location added successfully")
                                                .data(location)
                                                .build());
        }

        @GetMapping("/projects/{projectId}/locations")
        public ResponseEntity<ApiResponse<List<SiteLocationResponseDto>>> getProjectLocations(
                        @PathVariable Long projectId) {
                var locations = siteLocationService.getLocationsByProject(projectId);
                return ResponseEntity.ok(ApiResponse.<List<SiteLocationResponseDto>>builder()
                                .success(true)
                                .message("Locations fetched")
                                .data(locations)
                                .build());
        }

        @DeleteMapping("/locations/{locationId}")
        public ResponseEntity<ApiResponse<Void>> deleteLocation(@PathVariable Long locationId) {
                siteLocationService.deleteLocation(locationId);
                return ResponseEntity.ok(ApiResponse.<Void>builder()
                                .success(true)
                                .message("Location deleted successfully")
                                .build());
        }
}
