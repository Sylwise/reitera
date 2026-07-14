package com.reitera_api.service;

import com.reitera_api.dto.ReviewSessionRequestDTO;
import com.reitera_api.entity.Difficulty;
import com.reitera_api.entity.ReviewSession;
import com.reitera_api.entity.Topic;
import com.reitera_api.entity.User;
import com.reitera_api.exception.ResourceNotFoundException;
import com.reitera_api.exception.TopicAlreadyMasteredException;
import com.reitera_api.repository.ReviewSessionRepository;
import com.reitera_api.repository.TopicRepository;
import com.reitera_api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Service
public class ReviewSessionService {

    private final ReviewSessionRepository reviewSessionRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;

    public ReviewSessionService(ReviewSessionRepository reviewSessionRepository, TopicRepository topicRepository, UserRepository userRepository) {
        this.reviewSessionRepository = reviewSessionRepository;
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void addReviewSession(Long topicId, ReviewSessionRequestDTO dto, User user) {
        Topic topic = topicRepository.findByIdAndSubjectUserId(topicId, user.getId()).orElseThrow(() -> new ResourceNotFoundException("No topic found."));
        if (topic.getReviewCount() >= topic.getReviewsNeeded()) {
            throw new TopicAlreadyMasteredException("Topic is already mastered.");
        }
        topic.setReviewCount(topic.getReviewCount() + 1);
        if (topic.getReviewCount() < topic.getReviewsNeeded()) {
            topic.setNextReviewDate(calculateNextReviewDate(dto.getDifficulty()));
        } else {
            topic.setNextReviewDate(null);
        }
        streakCounter(user);
        userRepository.save(user);
        reviewSessionRepository.save(ReviewSession.create(dto, topic));
    }

    private static LocalDate calculateNextReviewDate(Difficulty difficulty) {
        return switch (difficulty) {
            case EASY -> LocalDate.now().plusDays(21);
            case NORMAL -> LocalDate.now().plusDays(14);
            case HARD -> LocalDate.now().plusDays(7);
        };
    }

    private static void streakCounter(User user) {

        if (LocalDate.now().equals(user.getLastReviewDate())) {
            return;
        }

        if (user.getLastReviewDate() == null || !user.getLastReviewDate().equals(LocalDate.now().minusDays(1))) {
            user.setLastReviewDate(LocalDate.now());
            user.setReviewStreak(1);
        } else {
            user.setLastReviewDate(LocalDate.now());
            user.setReviewStreak(user.getReviewStreak() + 1);
        }

    }

}
