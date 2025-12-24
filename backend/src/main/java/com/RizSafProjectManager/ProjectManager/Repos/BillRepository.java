package com.RizSafProjectManager.ProjectManager.Repos;

import com.RizSafProjectManager.ProjectManager.Models.Bill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT MAX(b.invoiceNumber) FROM Bill b")
    String findLastInvoiceNumber();

    Page<Bill> findByInvoiceNumberContainingIgnoreCase(String invoiceNumber, Pageable pageable);
}
