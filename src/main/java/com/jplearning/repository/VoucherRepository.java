package com.jplearning.repository;

import com.jplearning.entity.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCodeAndIsActiveTrue(String code);

    @Query("SELECT v FROM Voucher v WHERE v.code = :code AND v.isActive = true " +
            "AND v.validFrom <= :now AND v.validUntil >= :now")
    Optional<Voucher> findValidVoucherByCode(String code, LocalDateTime now);

    @Modifying
    @Query(value = "DELETE FROM voucher_applicable_courses WHERE voucher_id = :voucherId", nativeQuery = true)
    void deleteAllApplicableCourses(@Param("voucherId") Long voucherId);

    @Modifying
    @Query(value = "DELETE FROM voucher_applicable_combos WHERE voucher_id = :voucherId", nativeQuery = true)
    void deleteAllApplicableCombos(@Param("voucherId") Long voucherId);


    Page<Voucher> findByIsActiveTrue(Pageable pageable);

    Page<Voucher> findByIsActiveTrueAndValidFromBeforeAndValidUntilAfter(
            LocalDateTime now, LocalDateTime sameNow, Pageable pageable);

    @Query("SELECT v FROM Voucher v JOIN v.applicableCourses c WHERE c.id = :courseId " +
            "AND v.isActive = true AND v.validFrom <= :now AND v.validUntil >= :now")
    List<Voucher> findValidVouchersByCourseId(Long courseId, LocalDateTime now);

    @Query("SELECT v FROM Voucher v JOIN v.applicableCombos cb WHERE cb.id = :comboId " +
            "AND v.isActive = true AND v.validFrom <= :now AND v.validUntil >= :now")
    List<Voucher> findValidVouchersByComboId(Long comboId, LocalDateTime now);

}