package com.reitera_api.service;

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
        Integer currentStreak = user.getReviewStreak();
        List<WeakSpotDTO> weakSpots = reviewSessionRepository.findWeakSpots(user.getId(), PageRequest.of(0, 5));
        List<AtRiskDTO> atRisk = reviewSessionRepository.findAtRisk(user.getId(), PageRequest.of(0, 5));

        return new StatsResponseDTO(totalReviews, diffDistribution, currentStreak, buildActivity(user.getId()), weakSpots, atRisk);
    }

    private List<Long> buildActivity(Long userId) {
        List<DailyCountDTO> dailyCounts = reviewSessionRepository.countGroupedByDay(userId, LocalDate.now().minusDays(34));

        Map<LocalDate, Long> countsByDate = dailyCounts.stream()
                .collect(Collectors.toMap(DailyCountDTO::date, DailyCountDTO::count));

        List<Long> activity = new ArrayList<>();

        for (int i = 34; i >= 0; i--) {
            activity.add(countsByDate.getOrDefault(LocalDate.now().minusDays(i), 0L));
        }

        return activity;

    }

}
