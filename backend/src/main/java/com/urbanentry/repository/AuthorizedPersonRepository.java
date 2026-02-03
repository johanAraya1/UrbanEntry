package com.urbanentry.repository;

import com.urbanentry.entity.AuthorizedPerson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AuthorizedPersonRepository extends JpaRepository<AuthorizedPerson, Long> {

    List<AuthorizedPerson> findByHouseId(Long houseId);

    @Query("SELECT a FROM AuthorizedPerson a WHERE a.house.id = :houseId AND a.isActive = true")
    List<AuthorizedPerson> findActiveByHouseId(@Param("houseId") Long houseId);

    @Query("SELECT a FROM AuthorizedPerson a WHERE " +
           "a.isActive = true AND " +
           "(a.validUntil IS NULL OR a.validUntil >= :today)")
    List<AuthorizedPerson> findAllValidAuthorized(@Param("today") LocalDate today);

    @Query("SELECT a FROM AuthorizedPerson a WHERE " +
           "a.house.id = :houseId AND a.isActive = true AND " +
           "(a.validUntil IS NULL OR a.validUntil >= :today)")
    List<AuthorizedPerson> findValidByHouseId(@Param("houseId") Long houseId, @Param("today") LocalDate today);

    @Query("SELECT a FROM AuthorizedPerson a WHERE " +
           "a.isActive = true AND " +
           "(LOWER(a.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.licensePlate) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.idCard) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<AuthorizedPerson> searchAuthorized(@Param("query") String query);

    @Query("SELECT a FROM AuthorizedPerson a WHERE " +
           "LOWER(a.licensePlate) = LOWER(:plate) AND a.isActive = true AND " +
           "(a.validUntil IS NULL OR a.validUntil >= CURRENT_DATE)")
    List<AuthorizedPerson> findByLicensePlateValid(@Param("plate") String plate);

    @Query("SELECT a FROM AuthorizedPerson a WHERE " +
           "a.validUntil BETWEEN :startDate AND :endDate AND a.isActive = true")
    List<AuthorizedPerson> findExpiringSoon(@Param("startDate") LocalDate startDate, 
                                            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(a) FROM AuthorizedPerson a WHERE a.house.id = :houseId AND a.isActive = true")
    long countActiveByHouseId(@Param("houseId") Long houseId);
}
