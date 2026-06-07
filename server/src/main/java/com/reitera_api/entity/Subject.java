package com.reitera_api.entity;

import com.reitera_api.dto.SubjectRequestDTO;
import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    private String name;
    private String color;
    @Column (name = "total_topics")
    private int totalTopics;

    public Subject(){}

    public static Subject create (SubjectRequestDTO dto) {
        Subject subject = new Subject();
        subject.setName(dto.getName());
        subject.setColor(dto.getColor());
        subject.setTotalTopics(dto.getTotalTopics());
        return subject;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getName() {
        return name;
    }

    public String getColor() {
        return color;
    }

    public int getTotalTopics() {
        return totalTopics;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public void setTotalTopics(int totalTopics) {
        this.totalTopics = totalTopics;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Subject subject = (Subject) o;
        return Objects.equals(id, subject.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Subject{" +
                "id=" + id +
                ", user=" + (user != null ? user.getId() : null) +
                ", name='" + name + '\'' +
                ", color='" + color + '\'' +
                ", totalTopics=" + totalTopics +
                '}';
    }
}
