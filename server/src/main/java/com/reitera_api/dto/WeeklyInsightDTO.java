package com.reitera_api.dto;

public record WeeklyInsightDTO (Long subjectId, String subjectName, Long reviewCount, Double avgScore) {
}
