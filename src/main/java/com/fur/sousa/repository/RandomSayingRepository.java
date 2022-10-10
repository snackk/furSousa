package com.fur.sousa.repository;

import com.fur.sousa.domain.RandomSaying;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the RandomSaying entity.
 */
@SuppressWarnings("unused")
@Repository
public interface RandomSayingRepository extends JpaRepository<RandomSaying, Long> {}
