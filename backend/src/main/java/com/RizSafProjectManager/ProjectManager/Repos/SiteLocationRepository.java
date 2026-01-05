package com.RizSafProjectManager.ProjectManager.Repos;

import com.RizSafProjectManager.ProjectManager.Models.SiteLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteLocationRepository extends JpaRepository<SiteLocation, Long> {
    List<SiteLocation> findByProjectId(Long projectId);
}
