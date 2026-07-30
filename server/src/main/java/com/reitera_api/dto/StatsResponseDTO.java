package com.reitera_api.dto;

import java.util.List;

public record StatsResponseDTO(
        Long totalReviews,
        List<DifficultyCountDTO> diffDistribution,
        List<Long> activity,
        List<WeakSpotDTO> weakSpots,
        List<AtRiskDTO> atRisk,
        WeeklyComparisonDTO weeklyComparison
) {}
