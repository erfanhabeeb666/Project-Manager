package com.RizSafProjectManager.ProjectManager.Utils;

import com.RizSafProjectManager.ProjectManager.Dtos.LsgdRequestDto;
import com.RizSafProjectManager.ProjectManager.Dtos.LsgdResponseDto;
import com.RizSafProjectManager.ProjectManager.Models.Lsgd;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LsgdMapperImpl implements LsgdMapper {

    @Override
    public LsgdResponseDto toDto(Lsgd lsgd) {
        if (lsgd == null) {
            return null;
        }

        LsgdResponseDto dto = new LsgdResponseDto();
        dto.setId(lsgd.getId());
        dto.setName(lsgd.getName());
        dto.setType(lsgd.getType());
        dto.setDistrict(lsgd.getDistrict());
        dto.setBlock(lsgd.getBlock());
        dto.setWardCount(lsgd.getWardCount());
        dto.setStatus(lsgd.getStatus());
        dto.setCreatedAt(lsgd.getCreatedAt());
        dto.setUpdatedAt(lsgd.getUpdatedAt());
        return dto;
    }

    @Override
    public Lsgd toEntity(LsgdRequestDto dto) {
        if (dto == null) {
            return null;
        }

        Lsgd lsgd = new Lsgd();
        lsgd.setName(dto.getName());
        lsgd.setType(dto.getType());
        lsgd.setDistrict(dto.getDistrict());
        lsgd.setBlock(dto.getBlock());
        lsgd.setWardCount(dto.getWardCount());
        lsgd.setStatus(dto.getStatus());
        return lsgd;
    }

    @Override
    public List<LsgdResponseDto> toDtoList(List<Lsgd> lsgds) {
        if (lsgds == null || lsgds.isEmpty()) {
            return Collections.emptyList();
        }
        return lsgds.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
