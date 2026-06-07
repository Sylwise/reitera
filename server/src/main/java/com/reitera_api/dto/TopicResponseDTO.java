package com.reitera_api.dto;

import com.reitera_api.entity.Topic;

import java.time.LocalDate;

public record TopicResponseDTO(Long id, String name, Integer reviewCount, Integer reviewsNeeded, LocalDate nextReviewDate) {
    public static TopicResponseDTO fromEntity (Topic topic) {
        return new TopicResponseDTO(
                topic.getId(),
                topic.getName(),
                topic.getReviewCount(),
                topic.getReviewsNeeded(),
                topic.getNextReviewDate()
        );
    }
}
