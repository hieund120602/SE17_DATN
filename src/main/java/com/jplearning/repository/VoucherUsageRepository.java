package com.jplearning.repository;

import com.jplearning.entity.Student;
import com.jplearning.entity.Voucher;
import com.jplearning.entity.VoucherUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, Long> {
    List<VoucherUsage> findByVoucher(Voucher voucher);

    List<VoucherUsage> findByStudent(Student student);

    @Query("SELECT COUNT(vu) FROM VoucherUsage vu WHERE vu.voucher.id = :voucherId AND vu.student.id = :studentId")
    Long countByVoucherIdAndStudentId(Long voucherId, Long studentId);
}