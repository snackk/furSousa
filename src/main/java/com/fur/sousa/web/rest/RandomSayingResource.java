package com.fur.sousa.web.rest;

import com.fur.sousa.domain.RandomSaying;
import com.fur.sousa.repository.RandomSayingRepository;
import com.fur.sousa.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.SecureRandom;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.fur.sousa.domain.RandomSaying}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class RandomSayingResource {

    private final Logger log = LoggerFactory.getLogger(RandomSayingResource.class);

    private static final String ENTITY_NAME = "randomSaying";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final RandomSayingRepository randomSayingRepository;

    public RandomSayingResource(RandomSayingRepository randomSayingRepository) {
        this.randomSayingRepository = randomSayingRepository;
    }

    /**
     * {@code POST  /random-sayings} : Create a new randomSaying.
     *
     * @param randomSaying the randomSaying to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new randomSaying, or with status {@code 400 (Bad Request)} if the randomSaying has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/random-sayings")
    public ResponseEntity<RandomSaying> createRandomSaying(@Valid @RequestBody RandomSaying randomSaying) throws URISyntaxException {
        log.debug("REST request to save RandomSaying : {}", randomSaying);
        if (randomSaying.getId() != null) {
            throw new BadRequestAlertException("A new randomSaying cannot already have an ID", ENTITY_NAME, "idexists");
        }
        RandomSaying result = randomSayingRepository.save(randomSaying);
        return ResponseEntity
            .created(new URI("/api/random-sayings/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /random-sayings/:id} : Updates an existing randomSaying.
     *
     * @param id the id of the randomSaying to save.
     * @param randomSaying the randomSaying to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated randomSaying,
     * or with status {@code 400 (Bad Request)} if the randomSaying is not valid,
     * or with status {@code 500 (Internal Server Error)} if the randomSaying couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/random-sayings/{id}")
    public ResponseEntity<RandomSaying> updateRandomSaying(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody RandomSaying randomSaying
    ) throws URISyntaxException {
        log.debug("REST request to update RandomSaying : {}, {}", id, randomSaying);
        if (randomSaying.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, randomSaying.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!randomSayingRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        RandomSaying result = randomSayingRepository.save(randomSaying);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, randomSaying.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /random-sayings/:id} : Partial updates given fields of an existing randomSaying, field will ignore if it is null
     *
     * @param id the id of the randomSaying to save.
     * @param randomSaying the randomSaying to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated randomSaying,
     * or with status {@code 400 (Bad Request)} if the randomSaying is not valid,
     * or with status {@code 404 (Not Found)} if the randomSaying is not found,
     * or with status {@code 500 (Internal Server Error)} if the randomSaying couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/random-sayings/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<RandomSaying> partialUpdateRandomSaying(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody RandomSaying randomSaying
    ) throws URISyntaxException {
        log.debug("REST request to partial update RandomSaying partially : {}, {}", id, randomSaying);
        if (randomSaying.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, randomSaying.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!randomSayingRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<RandomSaying> result = randomSayingRepository
            .findById(randomSaying.getId())
            .map(existingRandomSaying -> {
                if (randomSaying.getContent() != null) {
                    existingRandomSaying.setContent(randomSaying.getContent());
                }
                if (randomSaying.getCreationDate() != null) {
                    existingRandomSaying.setCreationDate(randomSaying.getCreationDate());
                }

                return existingRandomSaying;
            })
            .map(randomSayingRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, randomSaying.getId().toString())
        );
    }

    /**
     * {@code GET  /random-sayings} : get all the randomSayings.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of randomSayings in body.
     */
    @GetMapping("/random-sayings")
    public ResponseEntity<List<RandomSaying>> getAllRandomSayings(@org.springdoc.api.annotations.ParameterObject Pageable pageable) {
        log.debug("REST request to get a page of RandomSayings");
        Page<RandomSaying> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0L);
        List<RandomSaying> randomSayings = randomSayingRepository.findAll();
        SecureRandom secureRandom = new SecureRandom();

        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), emptyPage);
        return ResponseEntity.ok().headers(headers).body(List.of(randomSayings.get(secureRandom.nextInt(randomSayings.size()))));
    }

    /**
     * {@code GET  /random-sayings/:id} : get the "id" randomSaying.
     *
     * @param id the id of the randomSaying to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the randomSaying, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/random-sayings/{id}")
    public ResponseEntity<RandomSaying> getRandomSaying(@PathVariable Long id) {
        log.debug("REST request to get RandomSaying : {}", id);
        Optional<RandomSaying> randomSaying = randomSayingRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(randomSaying);
    }

    /**
     * {@code DELETE  /random-sayings/:id} : delete the "id" randomSaying.
     *
     * @param id the id of the randomSaying to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/random-sayings/{id}")
    public ResponseEntity<Void> deleteRandomSaying(@PathVariable Long id) {
        log.debug("REST request to delete RandomSaying : {}", id);
        randomSayingRepository.deleteById(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
