package com.RizSafProjectManager.ProjectManager.Repos;

import com.RizSafProjectManager.ProjectManager.Enums.ExpenseType;
import com.RizSafProjectManager.ProjectManager.Models.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByProject_Id(Long projectId);

    @Query("SELECT e FROM Expense e WHERE " +
           "(:projectId IS NULL OR e.project.id = :projectId) AND " +
           "(:type IS NULL OR e.type = :type)")
    Page<Expense> findByProjectIdAndType(@Param("projectId") Long projectId,
                                          @Param("type") ExpenseType type,
                                          Pageable pageable);
}

