package com.RizSafProjectManager.ProjectManager.Utils;

import com.RizSafProjectManager.ProjectManager.Dtos.ContactRequestDto;
import com.RizSafProjectManager.ProjectManager.Dtos.ContactResponseDto;
import com.RizSafProjectManager.ProjectManager.Models.Contact;

import java.util.List;

public interface ContactMapper {
    ContactResponseDto toDto(Contact contact);

    Contact toEntity(ContactRequestDto dto);

    List<ContactResponseDto> toDtoList(List<Contact> contacts);
}
