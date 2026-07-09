package com.reitera_api.controller;

import com.reitera_api.dto.TopicRequestDTO;
import com.reitera_api.dto.TopicResponseDTO;
import com.reitera_api.entity.Topic;
import com.reitera_api.entity.User;
import com.reitera_api.service.TopicService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    private final TopicService service;

    public TopicController(TopicService service) {
        this.service = service;
    }

    @PostMapping()
    public ResponseEntity<TopicResponseDTO> addTopic(@Valid @RequestBody TopicRequestDTO dto,
            @AuthenticationPrincipal User user) {
        Topic saved = service.addTopic(dto.getSubjectId(), dto, user);
        TopicResponseDTO response = TopicResponseDTO.fromEntity(saved);
        return ResponseEntity.status(201).body(response);
    }

    @PostMapping("/{id}/reset")
    public ResponseEntity<TopicResponseDTO> resetTopic (@PathVariable Long id, @AuthenticationPrincipal User user) {
        Topic reset = service.resetTopic(id, user);
        return ResponseEntity.ok(TopicResponseDTO.fromEntity(reset));
    }

    @GetMapping()
    public ResponseEntity<List<TopicResponseDTO>> findTopics(@RequestParam(required = false) Long subjectId,
            @AuthenticationPrincipal User user) {
        List<Topic> existing = subjectId != null ? service.getTopicsBySubject(subjectId, user) : service.getAllTopics(user);
        List<TopicResponseDTO> responseDTOList = new ArrayList<>();

        for (Topic topic : existing) {
            responseDTOList.add(TopicResponseDTO.fromEntity(topic));
        }

        return ResponseEntity.ok(responseDTOList);

    }

    @GetMapping("/{id}")
    public ResponseEntity<TopicResponseDTO> findTopicById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(TopicResponseDTO.fromEntity(service.getById(id, user)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TopicResponseDTO> updateTopicById(@PathVariable Long id,
            @Valid @RequestBody TopicRequestDTO dto, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(TopicResponseDTO.fromEntity(service.updateTopic(id, dto, user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopicById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        service.deleteTopic(id, user);
        return ResponseEntity.noContent().build();
    }

}
