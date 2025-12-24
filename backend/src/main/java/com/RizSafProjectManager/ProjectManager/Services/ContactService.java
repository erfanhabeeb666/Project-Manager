package com.RizSafProjectManager.ProjectManager.Services;

import com.RizSafProjectManager.ProjectManager.Dtos.ContactRequestDto;
import com.RizSafProjectManager.ProjectManager.Dtos.ContactResponseDto;
import com.RizSafProjectManager.ProjectManager.Enums.ContactSource;
import com.RizSafProjectManager.ProjectManager.Enums.Status;
import com.RizSafProjectManager.ProjectManager.Exception.BadRequestException;
import com.RizSafProjectManager.ProjectManager.Exception.NotFoundException;
import com.RizSafProjectManager.ProjectManager.Models.Contact;
import com.RizSafProjectManager.ProjectManager.Models.Lsgd;
import com.RizSafProjectManager.ProjectManager.Repos.ContactRepository;
import com.RizSafProjectManager.ProjectManager.Repos.LsgdRepository;
import com.RizSafProjectManager.ProjectManager.Utils.ContactMapper;
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
public class ContactService {

    private final ContactRepository contactRepository;
    private final LsgdRepository lsgdRepository;
    private final ContactMapper contactMapper;

    @Transactional
    public ContactResponseDto createContact(UUID lsgdId, ContactRequestDto request) {
        Lsgd lsgd = lsgdRepository.findById(lsgdId)
                .orElseThrow(() -> new NotFoundException("LSGD not found with id: " + lsgdId));

        if (contactRepository.existsByLsgdIdAndPrimaryPhone(lsgdId, request.getPrimaryPhone())) {
            throw new BadRequestException("Contact with this primary phone already exists in this LSGD.");
        }

        Contact contact = contactMapper.toEntity(request);
        contact.setLsgd(lsgd);
        // existing Contact entity has @Where(clause = "status != 'DELETED'")
        // But we should set initial status
        contact.setStatus(Status.ACTIVE);

        contact = contactRepository.save(contact);
        return contactMapper.toDto(contact);
    }

    @Transactional(readOnly = true)
    public Page<ContactResponseDto> getContactsByLsgd(UUID lsgdId, Pageable pageable, String search, Boolean verified,
            ContactSource source) {
        // Verify LSGD exists? Not strictly necessary for search but good practice
        if (!lsgdRepository.existsById(lsgdId)) {
            throw new NotFoundException("LSGD not found with id: " + lsgdId);
        }

        Specification<Contact> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("lsgd").get("id"), lsgdId));

            if (search != null && !search.isBlank()) {
                String likePattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("personName")), likePattern),
                        cb.like(cb.lower(root.get("primaryPhone")), likePattern)));
            }

            if (verified != null) {
                predicates.add(cb.equal(root.get("verified"), verified));
            }

            if (source != null) {
                predicates.add(cb.equal(root.get("source"), source));
            }

            // No need to filter DELETED manually because of @Where on entity
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Contact> page = contactRepository.findAll(spec, pageable);
        return page.map(contactMapper::toDto);
    }

    @Transactional(readOnly = true)
    public ContactResponseDto getContactById(UUID id) {
        return contactRepository.findById(id) // Will return empty if DELETED due to @Where (usually)
                .map(contactMapper::toDto)
                .orElseThrow(() -> new NotFoundException("Contact not found with id: " + id));
    }

    @Transactional
    public ContactResponseDto updateContact(UUID id, ContactRequestDto request) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Contact not found with id: " + id));

        // Check uniqueness if phone changed
        if (!contact.getPrimaryPhone().equals(request.getPrimaryPhone())) {
            if (contactRepository.existsByLsgdIdAndPrimaryPhone(contact.getLsgd().getId(), request.getPrimaryPhone())) {
                throw new BadRequestException("Contact with this primary phone already exists in this LSGD.");
            }
        }

        contact.setPersonName(request.getPersonName());
        contact.setDesignation(request.getDesignation());
        contact.setDepartment(request.getDepartment());
        contact.setPrimaryPhone(request.getPrimaryPhone());
        contact.setSecondaryPhone(request.getSecondaryPhone());
        contact.setWhatsappNumber(request.getWhatsappNumber());
        contact.setEmail(request.getEmail());
        contact.setRemarks(request.getRemarks());
        contact.setSource(request.getSource());
        contact.setVerified(request.isVerified());

        contact = contactRepository.save(contact);
        return contactMapper.toDto(contact);
    }

    @Transactional
    public void deleteContact(UUID id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Contact not found with id: " + id));
        contact.setStatus(Status.DELETED);
        contactRepository.save(contact);
    }
}
