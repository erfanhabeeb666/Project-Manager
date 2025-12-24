package com.RizSafProjectManager.ProjectManager.Utils;

import com.RizSafProjectManager.ProjectManager.Dtos.ContactRequestDto;
import com.RizSafProjectManager.ProjectManager.Dtos.ContactResponseDto;
import com.RizSafProjectManager.ProjectManager.Models.Contact;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContactMapperImpl implements ContactMapper {

    @Override
    public ContactResponseDto toDto(Contact contact) {
        if (contact == null) {
            return null;
        }

        ContactResponseDto dto = new ContactResponseDto();
        dto.setId(contact.getId());
        if (contact.getLsgd() != null) {
            dto.setLsgdId(contact.getLsgd().getId());
            dto.setLsgdName(contact.getLsgd().getName());
        }
        dto.setPersonName(contact.getPersonName());
        dto.setDesignation(contact.getDesignation());
        dto.setDepartment(contact.getDepartment());
        dto.setPrimaryPhone(contact.getPrimaryPhone());
        dto.setSecondaryPhone(contact.getSecondaryPhone());
        dto.setWhatsappNumber(contact.getWhatsappNumber());
        dto.setEmail(contact.getEmail());
        dto.setRemarks(contact.getRemarks());
        dto.setSource(contact.getSource());
        dto.setVerified(contact.isVerified());
        dto.setCreatedBy(contact.getCreatedBy());
        dto.setCreatedAt(contact.getCreatedAt());
        dto.setUpdatedAt(contact.getUpdatedAt());
        dto.setStatus(contact.getStatus());
        return dto;
    }

    @Override
    public Contact toEntity(ContactRequestDto dto) {
        if (dto == null) {
            return null;
        }

        Contact contact = new Contact();
        contact.setPersonName(dto.getPersonName());
        contact.setDesignation(dto.getDesignation());
        contact.setDepartment(dto.getDepartment());
        contact.setPrimaryPhone(dto.getPrimaryPhone());
        contact.setSecondaryPhone(dto.getSecondaryPhone());
        contact.setWhatsappNumber(dto.getWhatsappNumber());
        contact.setEmail(dto.getEmail());
        contact.setRemarks(dto.getRemarks());
        contact.setSource(dto.getSource());
        contact.setVerified(dto.isVerified());
        return contact;
    }

    @Override
    public List<ContactResponseDto> toDtoList(List<Contact> contacts) {
        if (contacts == null || contacts.isEmpty()) {
            return Collections.emptyList();
        }
        return contacts.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
