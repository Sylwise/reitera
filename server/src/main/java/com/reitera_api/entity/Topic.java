package com.reitera_api.entity;

import com.reitera_api.dto.TopicRequestDTO;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.boot.context.properties.bind.DefaultValue;


import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table (name = "topics")
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(name = "review_count")
    private Integer reviewCount;
    @Column (name = "reviews_needed")
    private Integer reviewsNeeded;
    @Column (name = "next_review_date")
    private LocalDate nextReviewDate;
    @ManyToOne
    @JoinColumn (name = "subject_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Subject subject;
    @Column(name = "ease_factor")
    private Double easeFactor;
    @Column(name = "current_interval_days")
    private Integer currentIntervalDays;

   public static Topic create(TopicRequestDTO dto, Subject subject) {
        Topic topic = new Topic();
        topic.setName(dto.getName());
        topic.setReviewsNeeded(dto.getReviewsNeeded());
        topic.setSubject(subject);
        topic.setReviewCount(0);
        topic.setNextReviewDate(LocalDate.now());
        topic.setEaseFactor(2.5);
        topic.setCurrentIntervalDays(0);
        return topic;
   }

    public Topic() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getReviewCount() {
        return reviewCount;
    }

    public int getReviewsNeeded() {
        return reviewsNeeded;
    }

    public LocalDate getNextReviewDate() {
        return nextReviewDate;
    }

    public Subject getSubject() {
        return subject;
    }

    public double getEaseFactor() {
        return easeFactor;
    }

    public int getCurrentIntervalDays() {
        return currentIntervalDays;
    }

    public void setEaseFactor(double easeFactor) {
        this.easeFactor = easeFactor;
    }

    public void setCurrentIntervalDays(int currentIntervalDays) {
        this.currentIntervalDays = currentIntervalDays;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setReviewCount(int reviewCount) {
        this.reviewCount = reviewCount;
    }

    public void setReviewsNeeded(int reviewsNeeded) {
        this.reviewsNeeded = reviewsNeeded;
    }

    public void setNextReviewDate(LocalDate nextReviewDate) {
        this.nextReviewDate = nextReviewDate;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Topic topic = (Topic) o;
        return Objects.equals(id, topic.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Topic{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", reviewCount=" + reviewCount +
                ", reviewsNeeded=" + reviewsNeeded +
                ", nextReviewDate=" + nextReviewDate +
                ", subject=" + subject +
                '}';
    }
}
