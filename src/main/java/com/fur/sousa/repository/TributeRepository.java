package com.fur.sousa.repository;

import com.fur.sousa.domain.Tribute;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Tribute entity.
 */
@Repository
public interface TributeRepository extends JpaRepository<Tribute, Long> {
    @Query(
        value = "select tribute from Tribute tribute where tribute.user.login = ?#{principal.username}",
        countQuery = "select count(distinct tribute) from Tribute tribute where tribute.user.login = ?#{principal.username}"
    )
    Page<Tribute> pageableTributesByUser(Pageable pageable);

    @Query("select tribute from Tribute tribute where tribute.user.login = ?#{principal.username}")
    List<Tribute> findByUserIsCurrentUser();

    default Optional<Tribute> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Tribute> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Tribute> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select distinct tribute from Tribute tribute left join fetch tribute.user",
        countQuery = "select count(distinct tribute) from Tribute tribute"
    )
    Page<Tribute> findAllWithToOneRelationships(Pageable pageable);

    @Query("select distinct tribute from Tribute tribute left join fetch tribute.user")
    List<Tribute> findAllWithToOneRelationships();

    @Query("select tribute from Tribute tribute left join fetch tribute.user where tribute.id =:id")
    Optional<Tribute> findOneWithToOneRelationships(@Param("id") Long id);
}
