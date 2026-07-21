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

    private static final int PROGRESS_STEP_CAP_DAYS = 3;

    @Transactional
    public void addReviewSession(Long topicId, ReviewSessionRequestDTO dto, User user) {
        Topic topic = topicRepository.findByIdAndSubjectUserId(topicId, user.getId()).orElseThrow(() -> new ResourceNotFoundException("No topic found."));
        if (topic.isMastered()) {
            throw new TopicAlreadyMasteredException("Topic is already mastered.");
        }
        if (dto.getDifficulty() != Difficulty.AGAIN) {
            topic.setReviewCount(topic.getReviewCount() + 1);
        }
        LocalDate candidateNextDate = calculateNextReviewDate(topic, dto.getDifficulty());
        topic.setNextReviewDate(topic.isMastered() ? null : candidateNextDate);
        streakCounter(user);
        userRepository.save(user);
        reviewSessionRepository.save(ReviewSession.create(dto, topic));
    }

    private static LocalDate calculateNextReviewDate(Topic topic, Difficulty difficulty) {
        double easeFactor = topic.getEaseFactor();
        int currentInterval = topic.getCurrentIntervalDays();

        int nextInterval = switch (difficulty) {
            case AGAIN -> 1;
            case HARD -> currentInterval == 0 ? 2 : (int) Math.ceil(currentInterval * easeFactor * 0.8);
            case NORMAL -> currentInterval == 0 ? 4 : (int) Math.ceil(currentInterval * easeFactor);
            case EASY -> currentInterval == 0 ? 6 : (int) Math.ceil(currentInterval * easeFactor * 1.3);
        };

        double easeDelta = switch (difficulty) {
            case AGAIN -> -0.2;
            case HARD -> -0.15;
            case NORMAL -> 0;
            case EASY -> 0.15;
        };

        topic.setEaseFactor(Math.max(1.3, easeFactor + easeDelta));
        topic.setCurrentIntervalDays(nextInterval);

        if (nextInterval >= Topic.MASTERY_THRESHOLD_DAYS) {
            topic.setDisplayedProgressDays(Topic.MASTERY_THRESHOLD_DAYS);
        } else {
            int displayed = topic.getDisplayedProgressDays();
            int step = Math.max(-PROGRESS_STEP_CAP_DAYS, Math.min(PROGRESS_STEP_CAP_DAYS, nextInterval - displayed));
            topic.setDisplayedProgressDays(displayed + step);
        }

        return LocalDate.now().plusDays(nextInterval);
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
