package com.talentbridge.backend.repository;

import com.talentbridge.backend.entity.ApplicationNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationNoteRepository extends JpaRepository<ApplicationNote, Long> {

    /** Shared notes + the viewer's own private notes, newest first. */
    @Query("SELECT n FROM ApplicationNote n WHERE n.applicationId = :applicationId "
            + "AND (n.isPrivate = false OR n.authorUserId = :viewerUserId) ORDER BY n.createdAt DESC, n.id DESC")
    List<ApplicationNote> findVisible(@Param("applicationId") Long applicationId, @Param("viewerUserId") Long viewerUserId);
}
