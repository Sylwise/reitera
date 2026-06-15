package com.reitera_api.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table (name = "review_sessions")
public class ReviewSession {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;
    private String score;
    @Column (name = "reviewed_at")
    private LocalDateTime reviewedAt;
    @JoinColumn (name = "topic_id")
    @ManyToOne
    private Topic topic;


}
