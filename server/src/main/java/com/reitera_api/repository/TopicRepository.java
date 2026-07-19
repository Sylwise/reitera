package com.reitera_api.repository;

import com.reitera_api.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, Long> {

    List<Topic> findBySubjectIdAndSubjectUserId(Long subjectId, Long userId);

    List<Topic> findBySubjectUserId (Long userId);

    Optional<Topic> findByIdAndSubjectUserId(Long topicId, Long userId);

    @Query("SELECT COUNT(t) FROM Topic t WHERE t.subject.id = :subjectId")
    Long countTopicsBySubjectId(@Param("subjectId") Long subjectId);

}
