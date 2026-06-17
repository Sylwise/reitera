package com.reitera_api.service;

import com.reitera_api.dto.ReviewSessionRequestDTO;
import com.reitera_api.entity.Difficulty;
import com.reitera_api.entity.ReviewSession;
import com.reitera_api.entity.Topic;
import com.reitera_api.repository.ReviewSessionRepository;
import com.reitera_api.repository.TopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class ReviewSessionService {

    private final ReviewSessionRepository reviewSessionRepository;
    private final TopicRepository topicRepository;

    public ReviewSessionService(ReviewSessionRepository reviewSessionRepository, TopicRepository topicRepository) {
        this.reviewSessionRepository = reviewSessionRepository;
        this.topicRepository = topicRepository;
    }

    @Transactional
    public void addReviewSession(Long topicId, ReviewSessionRequestDTO dto) {
        Topic topic = topicRepository.findById(topicId).orElseThrow(() -> new RuntimeException("No topic found."));
        if(topic.getReviewCount() >= topic.getReviewsNeeded()) {
            throw new RuntimeException("Topic is already mastered.");
        }
        topic.setReviewCount(topic.getReviewCount() + 1);
        if (topic.getReviewCount() < topic.getReviewsNeeded()) {
            topic.setNextReviewDate(calculateNextReviewDate(dto.getDifficulty()));
        } else {
            topic.setNextReviewDate(null);
        }
        topicRepository.save(topic);
        reviewSessionRepository.save(ReviewSession.create(dto, topic));
    }

    private static LocalDate calculateNextReviewDate(Difficulty difficulty) {
        return switch (difficulty) {
            case EASY -> LocalDate.now().plusDays(21);
            case NORMAL -> LocalDate.now().plusDays(14);
            case HARD -> LocalDate.now().plusDays(7);
        };
    }

}
