package com.RizSafProjectManager.ProjectManager.Repos;

import com.RizSafProjectManager.ProjectManager.Models.ProjectDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectDocumentRepository extends JpaRepository<ProjectDocument, Long> {

    List<ProjectDocument> findByProjectIdOrderByUploadedAtDesc(Long projectId);

    Page<ProjectDocument> findByProjectId(Long projectId, Pageable pageable);

    @Query("SELECT d FROM ProjectDocument d WHERE d.project.id = :projectId AND " +
            "(LOWER(d.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(d.originalFilename) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(d.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<ProjectDocument> searchByProjectIdAndTerm(@Param("projectId") Long projectId,
            @Param("searchTerm") String searchTerm);

    @Query("SELECT d FROM ProjectDocument d WHERE " +
            "LOWER(d.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(d.originalFilename) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(d.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<ProjectDocument> searchGlobal(@Param("searchTerm") String searchTerm);

    long countByProjectId(Long projectId);
}
