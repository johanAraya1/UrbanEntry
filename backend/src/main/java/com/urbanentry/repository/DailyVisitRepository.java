package com.urbanentry.repository;

import com.urbanentry.entity.DailyVisit;
import com.urbanentry.entity.VisitStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyVisitRepository extends JpaRepository<DailyVisit, Long> {

    List<DailyVisit> findByHouseId(Long houseId);

    List<DailyVisit> findByVisitDate(LocalDate date);

    @Query("SELECT v FROM DailyVisit v WHERE v.visitDate = :date AND v.status = :status")
    List<DailyVisit> findByDateAndStatus(@Param("date") LocalDate date, @Param("status") VisitStatus status);

    @Query("SELECT v FROM DailyVisit v WHERE " +
           "v.visitDate = :date AND v.status = 'PENDING' " +
           "ORDER BY v.expectedTimeFrom ASC")
    List<DailyVisit> findTodayPendingVisits(@Param("date") LocalDate date);

    @Query("SELECT v FROM DailyVisit v WHERE " +
           "v.house.id = :houseId AND v.visitDate = :date")
    List<DailyVisit> findByHouseAndDate(@Param("houseId") Long houseId, @Param("date") LocalDate date);

    @Query("SELECT v FROM DailyVisit v WHERE " +
           "v.visitDate = :date AND " +
           "(LOWER(v.visitorName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(v.licensePlate) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<DailyVisit> searchTodayVisits(@Param("date") LocalDate date, @Param("query") String query);

    @Query("SELECT v FROM DailyVisit v WHERE " +
           "LOWER(v.licensePlate) = LOWER(:plate) AND " +
           "v.visitDate = :date AND v.status = 'PENDING'")
    List<DailyVisit> findByLicensePlateToday(@Param("plate") String plate, @Param("date") LocalDate date);

    @Query("SELECT v FROM DailyVisit v WHERE " +
           "v.visitDate BETWEEN :startDate AND :endDate AND v.house.id = :houseId " +
           "ORDER BY v.visitDate DESC, v.createdAt DESC")
    List<DailyVisit> findByHouseAndDateRange(@Param("houseId") Long houseId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);

    @Modifying
    @Query("UPDATE DailyVisit v SET v.status = 'EXPIRED' " +
           "WHERE v.visitDate < :today AND v.status = 'PENDING'")
    int expireOldVisits(@Param("today") LocalDate today);

    @Query("SELECT COUNT(v) FROM DailyVisit v WHERE " +
           "v.house.id = :houseId AND v.visitDate = :date")
    long countByHouseAndDate(@Param("houseId") Long houseId, @Param("date") LocalDate date);
}
