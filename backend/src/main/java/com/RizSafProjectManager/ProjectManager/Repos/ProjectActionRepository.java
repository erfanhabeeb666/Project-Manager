package com.RizSafProjectManager.ProjectManager.Repos;

import com.RizSafProjectManager.ProjectManager.Models.ProjectAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface ProjectActionRepository extends JpaRepository<ProjectAction, Long> {
    List<ProjectAction> findByActionDate(LocalDate date);
    
    @Query("SELECT a FROM ProjectAction a JOIN FETCH a.project WHERE a.actionDate = :date")
    List<ProjectAction> findByActionDateWithProject(@Param("date") LocalDate date);
    
    List<ProjectAction> findByProjectIdOrderByActionDateAsc(Long projectId);
    
    @Query("SELECT a FROM ProjectAction a JOIN FETCH a.project WHERE a.actionDate BETWEEN :from AND :to")
    List<ProjectAction> findByActionDateBetweenWithProject(@Param("from") LocalDate from, @Param("to") LocalDate to);

}