package com.RizSafProjectManager.ProjectManager.Controllers;

import com.RizSafProjectManager.ProjectManager.Dtos.ApiResponse;
import com.RizSafProjectManager.ProjectManager.Dtos.ContactRequestDto;
import com.RizSafProjectManager.ProjectManager.Dtos.ContactResponseDto;
import com.RizSafProjectManager.ProjectManager.Enums.ContactSource;
import com.RizSafProjectManager.ProjectManager.Services.ContactService;
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
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContactController {

        private final ContactService contactService;

        @PostMapping("/lsgds/{lsgdId}/contacts")
        @PreAuthorize("hasAuthority('OFFICE_STAFF')")
        public ResponseEntity<ApiResponse<ContactResponseDto>> createContact(
                        @PathVariable UUID lsgdId,
                        @Valid @RequestBody ContactRequestDto request) {
                ContactResponseDto response = contactService.createContact(lsgdId, request);
                return ResponseEntity.ok(ApiResponse.<ContactResponseDto>builder()
                                .success(true)
                                .message("Contact created successfully")
                                .data(response)
                                .build());
        }

        @GetMapping("/lsgds/{lsgdId}/contacts")
        @PreAuthorize("hasAnyAuthority('ADMIN', 'OFFICE_STAFF')")
        public ResponseEntity<ApiResponse<Page<ContactResponseDto>>> getContactsByLsgd(
                        @PathVariable UUID lsgdId,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size,
                        @RequestParam(required = false) String search,
                        @RequestParam(required = false) Boolean verified,
                        @RequestParam(required = false) ContactSource source) {

                Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                Page<ContactResponseDto> result = contactService.getContactsByLsgd(lsgdId, pageable, search, verified,
                                source);

                return ResponseEntity.ok(ApiResponse.<Page<ContactResponseDto>>builder()
                                .success(true)
                                .message("Contacts fetched successfully")
                                .data(result)
                                .build());
        }

        @GetMapping("/contacts/{id}")
        @PreAuthorize("hasAnyAuthority('ADMIN', 'OFFICE_STAFF')")
        public ResponseEntity<ApiResponse<ContactResponseDto>> getContactById(@PathVariable UUID id) {
                ContactResponseDto response = contactService.getContactById(id);
                return ResponseEntity.ok(ApiResponse.<ContactResponseDto>builder()
                                .success(true)
                                .message("Contact fetched successfully")
                                .data(response)
                                .build());
        }

        @PutMapping("/contacts/{id}")
        @PreAuthorize("hasAuthority('OFFICE_STAFF')")
        public ResponseEntity<ApiResponse<ContactResponseDto>> updateContact(
                        @PathVariable UUID id,
                        @Valid @RequestBody ContactRequestDto request) {
                ContactResponseDto response = contactService.updateContact(id, request);
                return ResponseEntity.ok(ApiResponse.<ContactResponseDto>builder()
                                .success(true)
                                .message("Contact updated successfully")
                                .data(response)
                                .build());
        }

        @DeleteMapping("/contacts/{id}")
        @PreAuthorize("hasAuthority('OFFICE_STAFF')")
        public ResponseEntity<ApiResponse<Void>> deleteContact(@PathVariable UUID id) {
                contactService.deleteContact(id);
                return ResponseEntity.ok(ApiResponse.<Void>builder()
                                .success(true)
                                .message("Contact deleted successfully")
                                .build());
        }
}
