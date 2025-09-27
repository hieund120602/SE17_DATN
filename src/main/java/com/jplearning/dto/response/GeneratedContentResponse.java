package com.jplearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedContentResponse {
    private String title;
    private String overview;
    private String content;
    private List<VocabularyItem> vocabulary;
    private List<GrammarPoint> grammarPoints;
    private String promptUsed;
}