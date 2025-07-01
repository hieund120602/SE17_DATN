package com.jplearning.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tutors")
@PrimaryKeyJoinColumn(name = "user_id")
@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
public class Tutor extends User {
    @Column(name = "teaching_requirements", columnDefinition = "TEXT")
    private String teachingRequirements;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "tutor_id")
    private List<Education> educations = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "tutor_id")
    private List<Experience> experiences = new ArrayList<>();

    @Column(name = "certificate_urls", columnDefinition = "TEXT[]")
    @ElementCollection
    private List<String> certificateUrls = new ArrayList<>();

    // The below fields would be used for course creation and management
    // which will be implemented later

    /*
    @OneToMany(mappedBy = "tutor")
    private List<Course> courses = new ArrayList<>();
    */
}