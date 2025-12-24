package com.RizSafProjectManager.ProjectManager.Controllers;

import com.RizSafProjectManager.ProjectManager.Dtos.ApiResponse;
import com.RizSafProjectManager.ProjectManager.Dtos.LsgdRequestDto;
import com.RizSafProjectManager.ProjectManager.Dtos.LsgdResponseDto;
import com.RizSafProjectManager.ProjectManager.Enums.LsgdType;
import com.RizSafProjectManager.ProjectManager.Enums.Status;
import com.RizSafProjectManager.ProjectManager.Services.LsgdService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/lsgds")
@RequiredArgsConstructor
public class LsgdController {

    private final LsgdService lsgdService;

    @PostMapping
    @PreAuthorize("hasAuthority('OFFICE_STAFF')")
    public ResponseEntity<ApiResponse<LsgdResponseDto>> createLsgd(@Valid @RequestBody LsgdRequestDto request) {
        LsgdResponseDto response = lsgdService.createLsgd(request);
        return ResponseEntity.ok(ApiResponse.<LsgdResponseDto>builder()
                .success(true)
                .message("LSGD created successfully")
                .data(response)
                .build());
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OFFICE_STAFF')")
    public ResponseEntity<ApiResponse<Page<LsgdResponseDto>>> getAllLsgds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) LsgdType type,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) Status status) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<LsgdResponseDto> result = lsgdService.getAllLsgds(pageable, search, type, district, status);

        return ResponseEntity.ok(ApiResponse.<Page<LsgdResponseDto>>builder()
                .success(true)
                .message("LSGDs fetched successfully")
                .data(result)
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OFFICE_STAFF')")
    public ResponseEntity<ApiResponse<LsgdResponseDto>> getLsgdById(@PathVariable UUID id) {
        LsgdResponseDto response = lsgdService.getLsgdById(id);
        return ResponseEntity.ok(ApiResponse.<LsgdResponseDto>builder()
                .success(true)
                .message("LSGD fetched successfully")
                .data(response)
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('OFFICE_STAFF')")
    public ResponseEntity<ApiResponse<LsgdResponseDto>> updateLsgd(
            @PathVariable UUID id,
            @Valid @RequestBody LsgdRequestDto request) {
        LsgdResponseDto response = lsgdService.updateLsgd(id, request);
        return ResponseEntity.ok(ApiResponse.<LsgdResponseDto>builder()
                .success(true)
                .message("LSGD updated successfully")
                .data(response)
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('OFFICE_STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteLsgd(@PathVariable UUID id) {
        lsgdService.deleteLsgd(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .success(true)
                .message("LSGD deleted successfully")
                .build());
    }
}
