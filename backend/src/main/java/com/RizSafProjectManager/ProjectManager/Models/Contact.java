package com.RizSafProjectManager.ProjectManager.Models;

import com.RizSafProjectManager.ProjectManager.Enums.ContactSource;
import com.RizSafProjectManager.ProjectManager.Enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.Where;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "contacts", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "lsgd_id", "primaryPhone" })
}, indexes = {
        @Index(name = "idx_primary_phone", columnList = "primaryPhone"),
        @Index(name = "idx_lsgd_id", columnList = "lsgd_id")
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Where(clause = "status != 'DELETED'") // Deprecated in Hibernate 6.3 but standard for Spring Boot 3 + H5/6 transition
                                       // usually. Using it as requested.
public class Contact {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lsgd_id", nullable = false)
    private Lsgd lsgd;

    @Column(nullable = false)
    private String personName;

    private String designation;

    private String department;

    @Column(nullable = false)
    private String primaryPhone;

    private String secondaryPhone;

    private String whatsappNumber;

    private String email;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContactSource source;

    private boolean verified = false;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy; // Storing User Email or ID depending on AuditorAware impl.

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(insertable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE; // ACTIVE, DELETED? User said "ACTIVE / DELETED"
}
