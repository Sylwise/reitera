package com.reitera_api.entity;

import com.reitera_api.config.AppClock;
import com.reitera_api.dto.ReviewSessionRequestDTO;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table (name = "review_sessions")
public class ReviewSession {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;
    private Integer score;
    @Column (name = "reviewed_at")
    private LocalDate reviewedAt;
    @JoinColumn (name = "topic_id")
    @ManyToOne
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Topic topic;

    public static ReviewSession create (ReviewSessionRequestDTO dto, Topic topic) {
        ReviewSession reviewSession = new ReviewSession();
        reviewSession.setDifficulty(dto.getDifficulty());
        reviewSession.setScore(dto.getScore());
        reviewSession.setReviewedAt(AppClock.today());
        reviewSession.setTopic(topic);
        return reviewSession;
    }

    public ReviewSession() {
    }

    public Long getId() {
        return id;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public Integer getScore() {
        return score;
    }

    public LocalDate getReviewedAt() {
        return reviewedAt;
    }

    public Topic getTopic() {
        return topic;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public void setReviewedAt(LocalDate reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public void setTopic(Topic topic) {
        this.topic = topic;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        ReviewSession that = (ReviewSession) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "ReviewSession{" +
                "id=" + id +
                ", difficulty=" + difficulty +
                ", score=" + score +
                ", reviewedAt=" + reviewedAt +
                ", topic=" + topic +
                '}';
    }
}
