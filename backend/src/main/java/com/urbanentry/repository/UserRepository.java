package com.urbanentry.repository;

import com.urbanentry.entity.User;
import com.urbanentry.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(UserRole role);

    List<User> findByHouse_Id(Long houseId);

    List<User> findByHouse_IdAndRole(Long houseId, UserRole role);

    @Query("SELECT u FROM User u WHERE u.house.id = :houseId AND u.isActive = true")
    List<User> findActiveUsersByHouseId(@Param("houseId") Long houseId);

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.isActive = true")
    List<User> findActiveUsersByRole(@Param("role") UserRole role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.house.id = :houseId")
    long countByHouseId(@Param("houseId") Long houseId);
}
