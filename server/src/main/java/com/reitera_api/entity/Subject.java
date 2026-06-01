package com.reitera_api.entity;

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
    private int total_topics;

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

    public int getTotal_topics() {
        return total_topics;
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

    public void setTotal_topics(int total_topics) {
        this.total_topics = total_topics;
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
                ", total_topics=" + total_topics +
                '}';
    }
}
