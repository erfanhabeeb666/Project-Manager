package com.RizSafProjectManager.ProjectManager.Utils;

import com.RizSafProjectManager.ProjectManager.Dtos.CreateActionRequestDto;
import com.RizSafProjectManager.ProjectManager.Dtos.ProjectActionDto;
import com.RizSafProjectManager.ProjectManager.Dtos.ProjectRequestDto;
import com.RizSafProjectManager.ProjectManager.Dtos.ProjectResponseDto;
import com.RizSafProjectManager.ProjectManager.Models.Project;
import com.RizSafProjectManager.ProjectManager.Models.ProjectAction;

import java.util.List;

public interface ProjectMapper {

    ProjectResponseDto toDto(Project project);

    Project toEntity(ProjectRequestDto dto);

    ProjectActionDto actionToDto(ProjectAction action);

    ProjectAction toActionEntity(CreateActionRequestDto dto);

    List<ProjectActionDto> actionsToDtoList(List<ProjectAction> actions);
}
