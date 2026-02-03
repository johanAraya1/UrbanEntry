package com.urbanentry.repository;

import com.urbanentry.entity.AccessLog;
import com.urbanentry.entity.AccessType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, Long> {

    List<AccessLog> findByHouseIdOrderByAccessTimeDesc(Long houseId);

    List<AccessLog> findByConfirmedByIdOrderByAccessTimeDesc(Long officerId);

    @Query("SELECT a FROM AccessLog a WHERE " +
           "a.accessTime BETWEEN :startTime AND :endTime " +
           "ORDER BY a.accessTime DESC")
    List<AccessLog> findByTimeRange(@Param("startTime") LocalDateTime startTime,
                                    @Param("endTime") LocalDateTime endTime);

    @Query("SELECT a FROM AccessLog a WHERE " +
           "a.house.id = :houseId AND " +
           "a.accessTime BETWEEN :startTime AND :endTime " +
           "ORDER BY a.accessTime DESC")
    List<AccessLog> findByHouseAndTimeRange(@Param("houseId") Long houseId,
                                            @Param("startTime") LocalDateTime startTime,
                                            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT a FROM AccessLog a WHERE " +
           "a.accessType = :type AND " +
           "a.accessTime BETWEEN :startTime AND :endTime " +
           "ORDER BY a.accessTime DESC")
    List<AccessLog> findByTypeAndTimeRange(@Param("type") AccessType type,
                                           @Param("startTime") LocalDateTime startTime,
                                           @Param("endTime") LocalDateTime endTime);

    @Query("SELECT COUNT(a) FROM AccessLog a WHERE " +
           "a.house.id = :houseId AND " +
           "a.accessTime BETWEEN :startTime AND :endTime")
    long countByHouseAndTimeRange(@Param("houseId") Long houseId,
                                   @Param("startTime") LocalDateTime startTime,
                                   @Param("endTime") LocalDateTime endTime);

    @Query("SELECT a FROM AccessLog a WHERE a.visit.id = :visitId")
    List<AccessLog> findByVisitId(@Param("visitId") Long visitId);

    boolean existsByVisitId(Long visitId);
}
