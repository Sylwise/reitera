package com.reitera_api.controller;

import com.reitera_api.dto.StatsResponseDTO;
import com.reitera_api.entity.User;
import com.reitera_api.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController (StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping
    public ResponseEntity<StatsResponseDTO> getStats(@AuthenticationPrincipal User user) {
       return ResponseEntity.ok(statsService.getStats(user));
    }

}
