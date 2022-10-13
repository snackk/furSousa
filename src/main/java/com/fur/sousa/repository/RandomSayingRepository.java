package com.fur.sousa.repository;

import com.fur.sousa.domain.RandomSaying;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the RandomSaying entity.
 */
@SuppressWarnings("unused")
@Repository
public interface RandomSayingRepository extends JpaRepository<RandomSaying, Long> {
    @Query(
        value = "select saying from RandomSaying saying ORDER BY rand()",
        countQuery = "select count(distinct tribute) from Tribute tribute where tribute.user.login = ?#{principal.username}"
    )
    Page<RandomSaying> indeedRandomSaying(Pageable pageable);
}
