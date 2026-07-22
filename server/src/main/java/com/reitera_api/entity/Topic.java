package com.reitera_api.entity;

import com.reitera_api.config.AppClock;
import com.reitera_api.dto.TopicRequestDTO;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

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
    @Column(name = "displayed_progress_days")
    private Integer displayedProgressDays;

    public static final int MASTERY_THRESHOLD_DAYS = 30;

   public static Topic create(TopicRequestDTO dto, Subject subject) {
        Topic topic = new Topic();
        topic.setName(dto.getName());
        topic.setSubject(subject);
        topic.setReviewCount(0);
        topic.setNextReviewDate(AppClock.today());
        topic.setEaseFactor(2.5);
        topic.setCurrentIntervalDays(0);
        topic.setDisplayedProgressDays(0);
        return topic;
   }

    public boolean isMastered() {
        return nextReviewDate == null || getCurrentIntervalDays() >= MASTERY_THRESHOLD_DAYS;
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
        return reviewCount == null ? 0 : reviewCount;
    }

    public LocalDate getNextReviewDate() {
        return nextReviewDate;
    }

    public Subject getSubject() {
        return subject;
    }

    public double getEaseFactor() {
        return easeFactor == null ? 2.5 : easeFactor;
    }

    public int getCurrentIntervalDays() {
        return currentIntervalDays == null ? 0 : currentIntervalDays;
    }

    public int getDisplayedProgressDays() {
        return displayedProgressDays == null ? 0 : displayedProgressDays;
    }

    public void setEaseFactor(double easeFactor) {
        this.easeFactor = easeFactor;
    }

    public void setCurrentIntervalDays(int currentIntervalDays) {
        this.currentIntervalDays = currentIntervalDays;
    }

    public void setDisplayedProgressDays(int displayedProgressDays) {
        this.displayedProgressDays = displayedProgressDays;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setReviewCount(int reviewCount) {
        this.reviewCount = reviewCount;
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
                ", nextReviewDate=" + nextReviewDate +
                ", subject=" + subject +
                '}';
    }
}
