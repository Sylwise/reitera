package com.reitera_api.entity;

import com.reitera_api.dto.ExamRequestDTO;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table (name = "exams")
public class Exam {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(name = "exam_date")
    private LocalDate examDate;
    @JoinColumn (name = "subject_id")
    @ManyToOne
    private Subject subject;

    public Exam() {
    }

    public static Exam create(ExamRequestDTO dto, Subject subject) {
        Exam exam = new Exam();
        exam.setName(dto.getName());
        exam.setExamDate(dto.getExamDate());
        exam.setSubject(subject);
        return exam;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getExamDate() {
        return examDate;
    }

    public void setExamDate(LocalDate examDate) {
        this.examDate = examDate;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Exam exam = (Exam) o;
        return Objects.equals(id, exam.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Exam{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", examDate=" + examDate +
                ", subject=" + subject +
                '}';
    }
}
