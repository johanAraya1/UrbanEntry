package com.urbanentry.repository;

import com.urbanentry.entity.House;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HouseRepository extends JpaRepository<House, Long> {

    Optional<House> findByHouseNumber(String houseNumber);

    boolean existsByHouseNumber(String houseNumber);

    List<House> findByIsActiveTrue();

    @Query("SELECT h FROM House h WHERE h.admin.id = :adminId")
    Optional<House> findByAdminId(@Param("adminId") Long adminId);

    @Query("SELECT h FROM House h WHERE h.section = :section AND h.isActive = true")
    List<House> findBySectionAndActive(@Param("section") String section);

    @Query("SELECT h FROM House h WHERE " +
           "LOWER(h.houseNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.section) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.address) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<House> searchHouses(@Param("query") String query);
}
