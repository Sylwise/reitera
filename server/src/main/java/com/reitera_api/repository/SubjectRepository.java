package com.reitera_api.repository;

import com.reitera_api.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    List<Subject> findByUserId(Long userId);

    Optional<Subject> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COUNT(s) FROM Subject s WHERE s.user.id = :id")
    Long countSubjectsByUserId (@Param("id") Long userId);

}
