package com.RizSafProjectManager.ProjectManager.Services;

import com.RizSafProjectManager.ProjectManager.Dtos.ProjectDocumentResponseDto;
import com.RizSafProjectManager.ProjectManager.Exception.BadRequestException;
import com.RizSafProjectManager.ProjectManager.Exception.NotFoundException;
import com.RizSafProjectManager.ProjectManager.Models.ProjectDocument;
import com.RizSafProjectManager.ProjectManager.Models.Project;
import com.RizSafProjectManager.ProjectManager.Models.OfficeStaff;
import com.RizSafProjectManager.ProjectManager.Repos.ProjectDocumentRepository;
import com.RizSafProjectManager.ProjectManager.Repos.ProjectRepository;
import com.RizSafProjectManager.ProjectManager.Repos.OfficeStaffRepository;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectDocumentService {

    private final ProjectDocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final OfficeStaffRepository officeStaffRepository;

    @Value("${document.upload.dir:uploads/documents}")
    private String uploadDir;

    private Path uploadPath;

    public ProjectDocumentService(ProjectDocumentRepository documentRepository,
            ProjectRepository projectRepository,
            OfficeStaffRepository officeStaffRepository) {
        this.documentRepository = documentRepository;
        this.projectRepository = projectRepository;
        this.officeStaffRepository = officeStaffRepository;
    }

    @PostConstruct
    public void init() {
        try {
            uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }
    }

    @Transactional
    public ProjectDocumentResponseDto uploadDocument(Long projectId, String title, String description,
            MultipartFile file, Long uploadedById) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));

        OfficeStaff uploader = officeStaffRepository.findById(uploadedById)
                .orElseThrow(() -> new NotFoundException("Staff user not found: " + uploadedById));

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

        // Validate filename
        if (originalFilename.contains("..")) {
            throw new BadRequestException("Invalid filename: " + originalFilename);
        }

        // Generate unique stored filename
        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            fileExtension = originalFilename.substring(dotIndex);
        }
        String storedFilename = UUID.randomUUID().toString() + fileExtension;

        try {
            // Create project-specific subdirectory
            Path projectDir = uploadPath.resolve("project_" + projectId);
            Files.createDirectories(projectDir);

            // Save file
            Path targetPath = projectDir.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // Create document record
            ProjectDocument document = ProjectDocument.builder()
                    .title(title != null && !title.trim().isEmpty() ? title.trim() : originalFilename)
                    .originalFilename(originalFilename)
                    .storedFilename(storedFilename)
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .description(description != null ? description.trim() : null)
                    .project(project)
                    .uploadedBy(uploader)
                    .uploadedAt(Instant.now())
                    .build();

            ProjectDocument saved = documentRepository.save(document);
            return mapToDto(saved);

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + originalFilename, e);
        }
    }

    public List<ProjectDocumentResponseDto> getDocumentsByProject(Long projectId) {
        return documentRepository.findByProjectIdOrderByUploadedAtDesc(projectId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProjectDocumentResponseDto> searchDocuments(Long projectId, String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            if (projectId != null) {
                return getDocumentsByProject(projectId);
            }
            return documentRepository.findAll().stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }

        List<ProjectDocument> documents;
        if (projectId != null) {
            documents = documentRepository.searchByProjectIdAndTerm(projectId, searchTerm.trim());
        } else {
            documents = documentRepository.searchGlobal(searchTerm.trim());
        }

        return documents.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ProjectDocumentResponseDto getDocument(Long documentId) {
        ProjectDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new NotFoundException("Document not found: " + documentId));
        return mapToDto(document);
    }

    public Resource downloadDocument(Long documentId) {
        ProjectDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new NotFoundException("Document not found: " + documentId));

        try {
            Path projectDir = uploadPath.resolve("project_" + document.getProject().getId());
            Path filePath = projectDir.resolve(document.getStoredFilename()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new NotFoundException("File not found: " + document.getOriginalFilename());
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found: " + document.getOriginalFilename(), e);
        }
    }

    public String getOriginalFilename(Long documentId) {
        ProjectDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new NotFoundException("Document not found: " + documentId));
        return document.getOriginalFilename();
    }

    public String getContentType(Long documentId) {
        ProjectDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new NotFoundException("Document not found: " + documentId));
        return document.getContentType();
    }

    @Transactional
    public void deleteDocument(Long documentId) {
        ProjectDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new NotFoundException("Document not found: " + documentId));

        try {
            Path projectDir = uploadPath.resolve("project_" + document.getProject().getId());
            Path filePath = projectDir.resolve(document.getStoredFilename());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log error but continue with database deletion
            System.err.println("Warning: Could not delete file: " + e.getMessage());
        }

        documentRepository.delete(document);
    }

    private ProjectDocumentResponseDto mapToDto(ProjectDocument document) {
        return ProjectDocumentResponseDto.builder()
                .id(document.getId())
                .title(document.getTitle())
                .originalFilename(document.getOriginalFilename())
                .contentType(document.getContentType())
                .fileSize(document.getFileSize())
                .description(document.getDescription())
                .projectId(document.getProject().getId())
                .projectName(document.getProject().getName())
                .uploadedById(document.getUploadedBy().getId())
                .uploadedByName(document.getUploadedBy().getName())
                .uploadedAt(document.getUploadedAt())
                .downloadUrl("/office-staff/documents/" + document.getId() + "/download")
                .build();
    }
}
