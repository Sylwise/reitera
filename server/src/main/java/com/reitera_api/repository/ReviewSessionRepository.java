package com.reitera_api.repository;

import com.reitera_api.dto.*;
import com.reitera_api.entity.ReviewSession;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;


public interface ReviewSessionRepository extends JpaRepository<ReviewSession, Long> {
    
    @Query("SELECT COUNT(rs) FROM ReviewSession rs WHERE rs.topic.subject.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT new com.reitera_api.dto.DifficultyCountDTO(rs.difficulty, COUNT(rs)) " +
            "FROM ReviewSession rs WHERE rs.topic.subject.user.id = :userId GROUP BY rs.difficulty")
    List<DifficultyCountDTO> countGroupedByDifficulty(@Param("userId") Long userId);

    @Query("SELECT new com.reitera_api.dto.DailyCountDTO(rs.reviewedAt, COUNT(rs)) " +
            "FROM ReviewSession rs " +
            "WHERE rs.topic.subject.user.id = :userId AND rs.reviewedAt >= :startDate " +
            "GROUP BY rs.reviewedAt " +
            "ORDER BY rs.reviewedAt DESC")
    List<DailyCountDTO> countGroupedByDay(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    @Query("SELECT new com.reitera_api.dto.WeakSpotDTO(rs.topic.id, rs.topic.name, rs.topic.subject.name, COUNT(rs)) " +
    "FROM ReviewSession rs " +
    "WHERE rs.topic.subject.user.id = :userId AND rs.difficulty = 'HARD' " +
    "GROUP BY rs.topic.id, rs.topic.subject.id "+
    "ORDER BY COUNT(rs) DESC")
    List<WeakSpotDTO> findWeakSpots(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT new com.reitera_api.dto.AtRiskDTO(rs.topic.id, rs.topic.name, rs.topic.subject.name, AVG(rs.score)) " +
    "FROM ReviewSession  rs " +
    "WHERE rs.topic.subject.user.id = :userId " +
    "GROUP BY rs.topic.id, rs.topic.subject.id " +
    "HAVING AVG(rs.score) < 6 AND COUNT(rs) >= 2 " +
    "ORDER BY AVG(rs.score) ASC")
    List<AtRiskDTO> findAtRisk (@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT new com.reitera_api.dto.WeeklyInsightDTO(rs.topic.subject.id, rs.topic.subject.name, COUNT(rs), AVG(rs.score)) " +
    "FROM ReviewSession rs " +
    "WHERE rs.topic.subject.user.id = :userId AND rs.reviewedAt >= :startDate " +
    "GROUP BY rs.topic.subject.id " +
    "HAVING COUNT(rs) >= 2 " +
    "ORDER BY AVG(rs.score) DESC"
    )
    List<WeeklyInsightDTO> findAverageScoresBySubject(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);
}
