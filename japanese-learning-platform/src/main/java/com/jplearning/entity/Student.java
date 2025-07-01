package com.jplearning.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "students")
@PrimaryKeyJoinColumn(name = "user_id")
@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
public class Student extends User {
    // Additional fields for Student can be added here

    // Optional: If you want to include relationships but avoid cycles
    @OneToMany(mappedBy = "student")
    @JsonIgnore // Prevent infinite recursion
    private List<Enrollment> enrollments = new ArrayList<>();
}