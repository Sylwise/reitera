package com.reitera_api.controller;

import com.reitera_api.dto.ReviewSessionRequestDTO;
import com.reitera_api.service.ReviewSessionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/topics")
public class ReviewSessionController {

    private final ReviewSessionService service;

    public ReviewSessionController (ReviewSessionService service) {
        this.service = service;
    }

    @PostMapping("/{id}/review-sessions")
    public ResponseEntity<Void> addReviewSession (@PathVariable Long id, @Valid @RequestBody ReviewSessionRequestDTO dto) {
        service.addReviewSession(id, dto);
        return ResponseEntity.status(201).build();
    }

}
