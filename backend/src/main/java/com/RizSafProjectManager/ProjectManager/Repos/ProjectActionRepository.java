package com.RizSafProjectManager.ProjectManager.Repos;

import com.RizSafProjectManager.ProjectManager.Models.ProjectAction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ProjectActionRepository extends JpaRepository<ProjectAction, Long> {
    List<ProjectAction> findByActionDate(LocalDate date);
    List<ProjectAction> findByProjectIdOrderByActionDateAsc(Long projectId);
    List<ProjectAction> findByActionDateBetween(LocalDate from, LocalDate to);

}