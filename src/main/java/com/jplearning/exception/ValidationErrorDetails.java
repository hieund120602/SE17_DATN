package com.jplearning.exception;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
public class ValidationErrorDetails extends ErrorDetails {
    private Map<String, String> errors;

    public ValidationErrorDetails(LocalDateTime timestamp, String message, String path, String errorCode, Map<String, String> errors) {
        super(timestamp, message, path, errorCode);
        this.errors = errors;
    }
}