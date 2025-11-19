package com.RizSafProjectManager.ProjectManager.Controllers;

import com.RizSafProjectManager.ProjectManager.Dtos.ApiResponse;
import com.RizSafProjectManager.ProjectManager.Dtos.OfficeStaffDTO;
import com.RizSafProjectManager.ProjectManager.Dtos.ProjectActionDto;
import com.RizSafProjectManager.ProjectManager.Dtos.ProjectResponseDto;
import com.RizSafProjectManager.ProjectManager.Models.OfficeStaff;
import com.RizSafProjectManager.ProjectManager.Models.Worker;
import com.RizSafProjectManager.ProjectManager.Services.AdminService;
import com.RizSafProjectManager.ProjectManager.Services.ProjectService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final ProjectService projectService;

    public AdminController(AdminService adminService, ProjectService projectService) {
        this.adminService = adminService;
        this.projectService = projectService;
    }

    @PostMapping("/add-staff")
    public ResponseEntity<String> addOfficeStaff(@RequestBody  OfficeStaff officeStaff){
        return adminService.addOfficeStaff(officeStaff);
    }
    @GetMapping("/list-staff")
    public ResponseEntity<List<OfficeStaffDTO>> listAllOfficeStaff(){
        return adminService.listAllStaffs();
    }
    @PostMapping("/add-worker")
    public ResponseEntity<String> addWorker(@RequestBody Worker worker){
        return adminService.addWorker(worker);
    }
    @GetMapping("/list-worker")
    public ResponseEntity<List<Worker>> listAllWorker(){
        return adminService.listAllWorkers();
    }
    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<Page<ProjectResponseDto>>> listProjects(
            @RequestParam Optional<String> stage,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> size) {
        Pageable pageable = PageRequest.of(page.orElse(0), size.orElse(20), Sort.by("createdAt").descending());
        var pageRes = projectService.listProjects(stage, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<ProjectResponseDto>>builder().success(true).message("Projects fetched").data(pageRes).build());
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<ProjectResponseDto>> getProject(@PathVariable Long id) {
        var dto = projectService.getProject(id);
        return ResponseEntity.ok(ApiResponse.<ProjectResponseDto>builder().success(true).message("Project fetched").data(dto).build());
    }

    // Admin read-only view of actions (global)
    @GetMapping("/actions")
    public ResponseEntity<ApiResponse<List<ProjectActionDto>>> listActions(
            @RequestParam Optional<String> date) {
        List<ProjectActionDto> result;
        if (date.isPresent()) {
            var localDate = java.time.LocalDate.parse(date.get());
            result = projectService.findActionsByDate(localDate);
        } else {
            result = projectService.findAllActions();
        }
        return ResponseEntity.ok(ApiResponse.<List<ProjectActionDto>>builder()
                .success(true).message("Actions fetched").data(result).build());
    }
}
