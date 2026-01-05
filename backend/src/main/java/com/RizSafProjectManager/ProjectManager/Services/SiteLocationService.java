package com.RizSafProjectManager.ProjectManager.Services;

import com.RizSafProjectManager.ProjectManager.Dtos.SiteLocationRequestDto;
import com.RizSafProjectManager.ProjectManager.Dtos.SiteLocationResponseDto;
import com.RizSafProjectManager.ProjectManager.Exception.NotFoundException;
import com.RizSafProjectManager.ProjectManager.Models.Project;
import com.RizSafProjectManager.ProjectManager.Models.SiteLocation;
import com.RizSafProjectManager.ProjectManager.Repos.ProjectRepository;
import com.RizSafProjectManager.ProjectManager.Repos.SiteLocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteLocationService {

    private final SiteLocationRepository siteLocationRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public SiteLocationResponseDto createLocation(Long projectId, SiteLocationRequestDto dto) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found with id: " + projectId));

        SiteLocation location = SiteLocation.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .googleMapLink(dto.getGoogleMapLink())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .project(project)
                .build();

        SiteLocation saved = siteLocationRepository.save(location);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SiteLocationResponseDto> getLocationsByProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new NotFoundException("Project not found with id: " + projectId);
        }
        return siteLocationRepository.findByProjectId(projectId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteLocation(Long locationId) {
        if (!siteLocationRepository.existsById(locationId)) {
            throw new NotFoundException("Location not found with id: " + locationId);
        }
        siteLocationRepository.deleteById(locationId);
    }

    private SiteLocationResponseDto mapToDto(SiteLocation location) {
        return SiteLocationResponseDto.builder()
                .id(location.getId())
                .name(location.getName())
                .address(location.getAddress())
                .googleMapLink(location.getGoogleMapLink())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .projectId(location.getProject().getId())
                .build();
    }
}
