package com.reitera_api.repository;

import com.reitera_api.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    Optional<Exam> findByIdAndSubjectUserId(Long examId, Long userId);

    List<Exam> findBySubjectIdAndSubjectUserId(Long subjectId, Long userId);

}
