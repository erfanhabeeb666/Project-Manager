package com.RizSafProjectManager.ProjectManager.Services;

import com.RizSafProjectManager.ProjectManager.Dtos.LsgdRequestDto;
import com.RizSafProjectManager.ProjectManager.Dtos.LsgdResponseDto;
import com.RizSafProjectManager.ProjectManager.Enums.LsgdType;
import com.RizSafProjectManager.ProjectManager.Enums.Status;
import com.RizSafProjectManager.ProjectManager.Exception.NotFoundException;
import com.RizSafProjectManager.ProjectManager.Models.Lsgd;
import com.RizSafProjectManager.ProjectManager.Repos.LsgdRepository;
import com.RizSafProjectManager.ProjectManager.Utils.LsgdMapper;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LsgdService {

    private final LsgdRepository lsgdRepository;
    private final LsgdMapper lsgdMapper;

    @Transactional
    public LsgdResponseDto createLsgd(LsgdRequestDto request) {
        Lsgd lsgd = lsgdMapper.toEntity(request);
        // Ensure status is handled if null, though DTO has default
        if (lsgd.getStatus() == null)
            lsgd.setStatus(Status.ACTIVE);
        lsgd = lsgdRepository.save(lsgd);
        return lsgdMapper.toDto(lsgd);
    }

    @Transactional(readOnly = true)
    public Page<LsgdResponseDto> getAllLsgds(Pageable pageable, String search, LsgdType type, String district,
            Status status) {
        Specification<Lsgd> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String likePattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), likePattern),
                        cb.like(cb.lower(root.get("district")), likePattern),
                        cb.like(cb.lower(root.get("block")), likePattern)));
            }

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            if (district != null && !district.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("district")), district.toLowerCase()));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            } else {
                // By default hide DELETED? If @Where is used, repository automatic filtering
                // happens.
                // Reuirement says "View list of LSGDs" and "Soft delete".
                // Usually admins might want to see deleted? Or just active/inactive.
                // Assuming @Where isn't on LSGD (I didn't put it there, only on Contact based
                // on request specifics for Contact).
                // "Enforce soft delete using @Where" was under general 4.4 Database Constraints
                // but listed "lsgd_id" etc.
                // Let's filter out DELETED by default unless specified otherwise or simply let
                // user filter.
                // If I soft delete to DELETED, I should exclude them here unless needed.
                // Prompt: "Soft delete LSGD". Status: "ACTIVE / INACTIVE".
                // I added DELETED.
                predicates.add(cb.notEqual(root.get("status"), Status.DELETED));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Lsgd> page = lsgdRepository.findAll(spec, pageable);
        return page.map(lsgdMapper::toDto);
    }

    @Transactional(readOnly = true)
    public LsgdResponseDto getLsgdById(UUID id) {
        return lsgdRepository.findById(id)
                .map(lsgdMapper::toDto)
                .orElseThrow(() -> new NotFoundException("LSGD not found with id: " + id));
    }

    @Transactional
    public LsgdResponseDto updateLsgd(UUID id, LsgdRequestDto request) {
        Lsgd lsgd = lsgdRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("LSGD not found with id: " + id));

        lsgd.setName(request.getName());
        lsgd.setType(request.getType());
        lsgd.setDistrict(request.getDistrict());
        lsgd.setBlock(request.getBlock());
        lsgd.setWardCount(request.getWardCount());
        if (request.getStatus() != null) {
            lsgd.setStatus(request.getStatus());
        }

        lsgd = lsgdRepository.save(lsgd);
        return lsgdMapper.toDto(lsgd);
    }

    @Transactional
    public void deleteLsgd(UUID id) {
        Lsgd lsgd = lsgdRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("LSGD not found with id: " + id));
        lsgd.setStatus(Status.DELETED);
        lsgdRepository.save(lsgd);
    }
}
