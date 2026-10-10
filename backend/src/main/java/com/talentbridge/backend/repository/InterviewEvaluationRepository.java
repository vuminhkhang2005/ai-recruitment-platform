package com.talentbridge.backend.repository;

import com.talentbridge.backend.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewEvaluationRepository extends JpaRepository<InterviewEvaluation, Long> {

    List<InterviewEvaluation> findByInterviewIdInOrderBySubmittedAtAsc(Collection<Long> interviewIds);

    Optional<InterviewEvaluation> findByInterviewIdAndInterviewerUserId(Long interviewId, Long interviewerUserId);
}
