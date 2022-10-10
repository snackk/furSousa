package com.fur.sousa.web.rest;

import com.fur.sousa.domain.Tribute;
import com.fur.sousa.repository.TributeRepository;
import com.fur.sousa.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.fur.sousa.domain.Tribute}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class TributeResource {

    private final Logger log = LoggerFactory.getLogger(TributeResource.class);

    private static final String ENTITY_NAME = "tribute";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TributeRepository tributeRepository;

    public TributeResource(TributeRepository tributeRepository) {
        this.tributeRepository = tributeRepository;
    }

    /**
     * {@code POST  /tributes} : Create a new tribute.
     *
     * @param tribute the tribute to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new tribute, or with status {@code 400 (Bad Request)} if the tribute has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/tributes")
    public ResponseEntity<Tribute> createTribute(@Valid @RequestBody Tribute tribute) throws URISyntaxException {
        log.debug("REST request to save Tribute : {}", tribute);
        if (tribute.getId() != null) {
            throw new BadRequestAlertException("A new tribute cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Tribute result = tributeRepository.save(tribute);
        return ResponseEntity
            .created(new URI("/api/tributes/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /tributes/:id} : Updates an existing tribute.
     *
     * @param id the id of the tribute to save.
     * @param tribute the tribute to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated tribute,
     * or with status {@code 400 (Bad Request)} if the tribute is not valid,
     * or with status {@code 500 (Internal Server Error)} if the tribute couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/tributes/{id}")
    public ResponseEntity<Tribute> updateTribute(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Tribute tribute
    ) throws URISyntaxException {
        log.debug("REST request to update Tribute : {}, {}", id, tribute);
        if (tribute.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, tribute.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!tributeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Tribute result = tributeRepository.save(tribute);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, tribute.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /tributes/:id} : Partial updates given fields of an existing tribute, field will ignore if it is null
     *
     * @param id the id of the tribute to save.
     * @param tribute the tribute to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated tribute,
     * or with status {@code 400 (Bad Request)} if the tribute is not valid,
     * or with status {@code 404 (Not Found)} if the tribute is not found,
     * or with status {@code 500 (Internal Server Error)} if the tribute couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/tributes/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<Tribute> partialUpdateTribute(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Tribute tribute
    ) throws URISyntaxException {
        log.debug("REST request to partial update Tribute partially : {}, {}", id, tribute);
        if (tribute.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, tribute.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!tributeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Tribute> result = tributeRepository
            .findById(tribute.getId())
            .map(existingTribute -> {
                if (tribute.getContent() != null) {
                    existingTribute.setContent(tribute.getContent());
                }
                if (tribute.getCreationDate() != null) {
                    existingTribute.setCreationDate(tribute.getCreationDate());
                }

                return existingTribute;
            })
            .map(tributeRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, tribute.getId().toString())
        );
    }

    /**
     * {@code GET  /tributes} : get all the tributes.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of tributes in body.
     */
    @GetMapping("/tributes")
    public ResponseEntity<List<Tribute>> getAllTributes(
        @org.springdoc.api.annotations.ParameterObject Pageable pageable,
        @RequestParam(required = false, defaultValue = "false") boolean eagerload
    ) {
        log.debug("REST request to get a page of Tributes");
        Page<Tribute> page;
        // org.springframework.security.core.userdetails.User [Username=admin, Password=[PROTECTED],
        // Enabled=true, AccountNonExpired=true, credentialsNonExpired=true, AccountNonLocked=true,
        // Granted Authorities=[ROLE_ADMIN, ROLE_USER]
        User principal = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        boolean shouldFindAll = principal.getAuthorities().stream().anyMatch(role -> role.getAuthority().equals("ROLE_SOUSA"));
        page = shouldFindAll ? tributeRepository.findAll(pageable) : tributeRepository.pageableTributesByUser(pageable);

        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /tributes/:id} : get the "id" tribute.
     *
     * @param id the id of the tribute to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the tribute, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/tributes/{id}")
    public ResponseEntity<Tribute> getTribute(@PathVariable Long id) {
        log.debug("REST request to get Tribute : {}", id);
        Optional<Tribute> tribute = tributeRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(tribute);
    }

    /**
     * {@code DELETE  /tributes/:id} : delete the "id" tribute.
     *
     * @param id the id of the tribute to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/tributes/{id}")
    public ResponseEntity<Void> deleteTribute(@PathVariable Long id) {
        log.debug("REST request to delete Tribute : {}", id);
        tributeRepository.deleteById(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
