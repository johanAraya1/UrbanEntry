package com.urbanentry.repository;

import com.urbanentry.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.isRead = false " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByUserId(@Param("userId") Long userId);

    @Query("SELECT n FROM Notification n WHERE n.isSent = false ORDER BY n.createdAt ASC")
    List<Notification> findPendingNotifications();

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.isRead = false")
    long countUnreadByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.isSent = true AND n.sentAt < :cutoffDate")
    int deleteOldSentNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT n FROM Notification n WHERE " +
           "n.user.id = :userId AND n.type = :type " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findByUserAndType(@Param("userId") Long userId, @Param("type") String type);
}
