package com.reitera_api.service;

import com.reitera_api.dto.TopicRequestDTO;
import com.reitera_api.entity.Subject;
import com.reitera_api.entity.Topic;
import com.reitera_api.entity.User;
import com.reitera_api.exception.ResourceNotFoundException;
import com.reitera_api.repository.SubjectRepository;
import com.reitera_api.repository.TopicRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TopicService {

    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;

    public TopicService(TopicRepository topicRepository, SubjectRepository subjectRepository) {
        this.topicRepository = topicRepository;
        this.subjectRepository = subjectRepository;
    }

    public Topic addTopic(Long subjectId, TopicRequestDTO topic, User user) {
        Subject subject = subjectRepository.findByIdAndUser(subjectId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found."));
        return topicRepository.save(Topic.create(topic, subject));
    }

    public List<Topic> getTopicsBySubject(Long subjectId, User user) {
        return topicRepository.findBySubjectIdAndSubjectUserId(subjectId, user.getId());
    }

    public List<Topic> getAllTopics(User user) {
        return topicRepository.findBySubjectUserId(user.getId());
    }

    public Topic getById(Long id, User user) {
        return topicRepository.findByIdAndSubjectUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found."));
    }

    public Topic updateTopic(Long id, TopicRequestDTO dto, User user) {
        Topic existing = topicRepository.findByIdAndSubjectUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found."));
        existing.setName(dto.getName());
        existing.setReviewsNeeded(dto.getReviewsNeeded());
        return topicRepository.save(existing);
    }

    public Topic resetTopic(Long id, User user) {
        Topic topic = topicRepository.findByIdAndSubjectUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found."));
        topic.setReviewCount(0);
        topic.setNextReviewDate(LocalDate.now());
        return topicRepository.save(topic);
    }

    public void deleteTopic(Long id, User user) {
        Topic existing = topicRepository.findByIdAndSubjectUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found."));
        topicRepository.delete(existing);
    }

}
