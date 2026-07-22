package com.reitera_api.service;

import com.reitera_api.config.AppClock;
import com.reitera_api.dto.*;
import com.reitera_api.entity.User;
import com.reitera_api.repository.ReviewSessionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StatsService {

    private final ReviewSessionRepository reviewSessionRepository;

    public StatsService(ReviewSessionRepository reviewSessionRepository) {
        this.reviewSessionRepository = reviewSessionRepository;
    }

    public StatsResponseDTO getStats(User user) {
        Long totalReviews = reviewSessionRepository.countByUserId(user.getId());
        List<DifficultyCountDTO> diffDistribution = reviewSessionRepository.countGroupedByDifficulty(user.getId());
        LocalDate currentDay = AppClock.today();
        Integer currentStreak = currentDay.minusDays(1).equals(user.getLastReviewDate()) || currentDay.equals(user.getLastReviewDate()) ? user.getReviewStreak() : 0;
        List<WeakSpotDTO> weakSpots = reviewSessionRepository.findWeakSpots(user.getId(), PageRequest.of(0, 5));
        List<AtRiskDTO> atRisk = reviewSessionRepository.findAtRisk(user.getId(), PageRequest.of(0, 5));

        return new StatsResponseDTO(totalReviews, diffDistribution, currentStreak, buildActivity(user.getId()), weakSpots, atRisk, buildSubjectHighlight(user.getId()));
    }

    private List<Long> buildActivity(Long userId) {
        List<DailyCountDTO> dailyCounts = reviewSessionRepository.countGroupedByDay(userId, AppClock.today().minusDays(34));

        Map<LocalDate, Long> countsByDate = dailyCounts.stream()
                .collect(Collectors.toMap(DailyCountDTO::date, DailyCountDTO::count));

        List<Long> activity = new ArrayList<>();

        for (int i = 34; i >= 0; i--) {
            activity.add(countsByDate.getOrDefault(AppClock.today().minusDays(i), 0L));
        }

        return activity;

    }

    private WeeklyComparisonDTO buildSubjectHighlight(Long userId) {
        List<WeeklyInsightDTO> findWeeklyInsight = reviewSessionRepository.findAverageScoresBySubject(userId, AppClock.today().minusDays(6));

        if (findWeeklyInsight.size() < 2) {
            return null;
        }

        SubjectHighlightDTO best = new SubjectHighlightDTO(findWeeklyInsight.getFirst().subjectName(), findWeeklyInsight.getFirst().avgScore());
        SubjectHighlightDTO worst = new SubjectHighlightDTO(findWeeklyInsight.getLast().subjectName(), findWeeklyInsight.getLast().avgScore());

        return new WeeklyComparisonDTO(best, worst);

    }

}
