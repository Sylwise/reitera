package com.reitera_api.repository;

import com.reitera_api.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, Long> {

    List<Topic> findBySubjectIdAndSubjectUserId(Long subjectId, Long userId);

    List<Topic> findBySubjectUserId (Long userId);

    Optional<Topic> findByIdAndSubjectUserId(Long topicId, Long userId);

}
