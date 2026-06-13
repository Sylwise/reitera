package com.reitera_api.dto;

import com.reitera_api.entity.Subject;

public record SubjectResponseDTO(Long id, String name, String color, int totalTopics) {

    public static SubjectResponseDTO fromEntity(Subject subject) {
        return new SubjectResponseDTO(
                subject.getId(),
                subject.getName(),
                subject.getColor(),
                subject.getTotalTopics()
        );
    }
}