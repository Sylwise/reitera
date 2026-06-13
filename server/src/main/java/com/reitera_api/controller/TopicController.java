package com.reitera_api.controller;

import com.reitera_api.dto.TopicRequestDTO;
import com.reitera_api.dto.TopicResponseDTO;
import com.reitera_api.entity.Topic;
import com.reitera_api.service.TopicService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    private final TopicService service;

    public TopicController (TopicService service) {
        this.service = service;
    }


    @PostMapping()
    public ResponseEntity<TopicResponseDTO> addTopic(@Valid @RequestBody TopicRequestDTO dto) {
        Topic saved = service.addTopic(dto.getSubjectId(), dto);
        TopicResponseDTO response = TopicResponseDTO.fromEntity(saved);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping()
    public ResponseEntity<List<TopicResponseDTO>> findTopicBySubjectId(@RequestParam Long subjectId) {
        List<Topic> existing = service.findBySubjectId(subjectId);
        List<TopicResponseDTO> responseDTOList = new ArrayList<>();

        for (Topic topic : existing) {
            responseDTOList.add(TopicResponseDTO.fromEntity(topic));
        }

        return ResponseEntity.ok(responseDTOList);

    }

    @GetMapping("/{id}")
    public ResponseEntity<TopicResponseDTO> findTopicById (@PathVariable Long id) {
        return ResponseEntity.ok(TopicResponseDTO.fromEntity(service.getById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TopicResponseDTO> updateTopicById (@PathVariable Long id, @Valid @RequestBody TopicRequestDTO dto) {
        return ResponseEntity.ok(TopicResponseDTO.fromEntity(service.updateTopic(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopicById(@PathVariable Long id) {
        service.deleteTopic(id);
        return ResponseEntity.noContent().build();
    }

}
