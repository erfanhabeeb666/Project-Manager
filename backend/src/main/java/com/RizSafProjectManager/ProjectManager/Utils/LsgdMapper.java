package com.RizSafProjectManager.ProjectManager.Utils;

import com.RizSafProjectManager.ProjectManager.Dtos.LsgdRequestDto;
import com.RizSafProjectManager.ProjectManager.Dtos.LsgdResponseDto;
import com.RizSafProjectManager.ProjectManager.Models.Lsgd;

import java.util.List;

public interface LsgdMapper {
    LsgdResponseDto toDto(Lsgd lsgd);

    Lsgd toEntity(LsgdRequestDto dto);

    List<LsgdResponseDto> toDtoList(List<Lsgd> lsgds);
}
