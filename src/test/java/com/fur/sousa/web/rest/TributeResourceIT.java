package com.fur.sousa.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fur.sousa.IntegrationTest;
import com.fur.sousa.domain.Tribute;
import com.fur.sousa.repository.TributeRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link TributeResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class TributeResourceIT {

    private static final String DEFAULT_CONTENT = "AAAAAAAAAA";
    private static final String UPDATED_CONTENT = "BBBBBBBBBB";

    private static final Instant DEFAULT_CREATION_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATION_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/tributes";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private TributeRepository tributeRepository;

    @Mock
    private TributeRepository tributeRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTributeMockMvc;

    private Tribute tribute;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Tribute createEntity(EntityManager em) {
        Tribute tribute = new Tribute().content(DEFAULT_CONTENT).creationDate(DEFAULT_CREATION_DATE);
        return tribute;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Tribute createUpdatedEntity(EntityManager em) {
        Tribute tribute = new Tribute().content(UPDATED_CONTENT).creationDate(UPDATED_CREATION_DATE);
        return tribute;
    }

    @BeforeEach
    public void initTest() {
        tribute = createEntity(em);
    }

    @Test
    @Transactional
    void createTribute() throws Exception {
        int databaseSizeBeforeCreate = tributeRepository.findAll().size();
        // Create the Tribute
        restTributeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(tribute)))
            .andExpect(status().isCreated());

        // Validate the Tribute in the database
        List<Tribute> tributeList = tributeRepository.findAll();
        assertThat(tributeList).hasSize(databaseSizeBeforeCreate + 1);
        Tribute testTribute = tributeList.get(tributeList.size() - 1);
        assertThat(testTribute.getContent()).isEqualTo(DEFAULT_CONTENT);
        assertThat(testTribute.getCreationDate()).isEqualTo(DEFAULT_CREATION_DATE);
    }

    @Test
    @Transactional
    void createTributeWithExistingId() throws Exception {
        // Create the Tribute with an existing ID
        tribute.setId(1L);

        int databaseSizeBeforeCreate = tributeRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restTributeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(tribute)))
            .andExpect(status().isBadRequest());

        // Validate the Tribute in the database
        List<Tribute> tributeList = tributeRepository.findAll();
        assertThat(tributeList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkContentIsRequired() throws Exception {
        int databaseSizeBeforeTest = tributeRepository.findAll().size();
        // set the field null
        tribute.setContent(null);

        // Create the Tribute, which fails.

        restTributeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(tribute)))
            .andExpect(status().isBadRequest());

        List<Tribute> tributeList = tributeRepository.findAll();
        assertThat(tributeList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllTributes() throws Exception {
        // Initialize the database
        tributeRepository.saveAndFlush(tribute);

        // Get all the tributeList
        restTributeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(tribute.getId().intValue())))
            .andExpect(jsonPath("$.[*].content").value(hasItem(DEFAULT_CONTENT)))
            .andExpect(jsonPath("$.[*].creationDate").value(hasItem(DEFAULT_CREATION_DATE.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllTributesWithEagerRelationshipsIsEnabled() throws Exception {
        when(tributeRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restTributeMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(tributeRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllTributesWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(tributeRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restTributeMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(tributeRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getTribute() throws Exception {
        // Initialize the database
        tributeRepository.saveAndFlush(tribute);

        // Get the tribute
        restTributeMockMvc
            .perform(get(ENTITY_API_URL_ID, tribute.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(tribute.getId().intValue()))
            .andExpect(jsonPath("$.content").value(DEFAULT_CONTENT))
            .andExpect(jsonPath("$.creationDate").value(DEFAULT_CREATION_DATE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingTribute() throws Exception {
        // Get the tribute
        restTributeMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingTribute() throws Exception {
        // Initialize the database
        tributeRepository.saveAndFlush(tribute);

        int databaseSizeBeforeUpdate = tributeRepository.findAll().size();

        // Update the tribute
        Tribute updatedTribute = tributeRepository.findById(tribute.getId()).get();
        // Disconnect from session so that the updates on updatedTribute are not directly saved in db
        em.detach(updatedTribute);
        updatedTribute.content(UPDATED_CONTENT).creationDate(UPDATED_CREATION_DATE);

        restTributeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedTribute.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedTribute))
            )
            .andExpect(status().isOk());

        // Validate the Tribute in the database
        List<Tribute> tributeList = tributeRepository.findAll();
        assertThat(tributeList).hasSize(databaseSizeBeforeUpdate);
        Tribute testTribute = tributeList.get(tributeList.size() - 1);
        assertThat(testTribute.getContent()).isEqualTo(UPDATED_CONTENT);
        assertThat(testTribute.getCreationDate()).isEqualTo(UPDATED_CREATION_DATE);
    }

    @Test
    @Transactional
    void putNonExistingTribute() throws Exception {
        int databaseSizeBeforeUpdate = tributeRepository.findAll().size();
        tribute.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTributeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, tribute.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(tribute))
            )
            .andExpect(status().isBadRequest());

        // Validate the Tribute in the database
        List<Tribute> tributeList = tributeRepository.findAll();
        assertThat(tributeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchTribute() throws Exception {
        int databaseSizeBeforeUpdate = tributeRepository.findAll().size();
        tribute.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTributeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(tribute))
            )
            .andExpect(status().isBadRequest());

        // Validate the Tribute in the database
        List<Tribute> tributeList = tributeRepository.findAll();
        assertThat(tributeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTribute() throws Exception {
        int databaseSizeBeforeUpdate = tributeRepository.findAll().size();
        tribute.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTributeMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(tribute)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Tribute in the database
        List<Tribute> tributeList = tributeRepository.findAll();
        assertThat(tributeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateTributeWithPatch() throws Exception {
        // Initialize the database
        tributeRepository.saveAndFlush(tribute);

        int databaseSizeBeforeUpdate = tributeRepository.findAll().size();

        // Update the tribute using partial update
        Tribute partialUpdatedTribute = new Tribute();
        partialUpdatedTribute.setId(tribute.getId());

        partialUpdatedTribute.content(UPDATED_CONTENT).creationDate(UPDATED_CREATION_DATE);

        restTributeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTribute.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedTribute))
            )
            .andExpect(status().isOk());

        // Validate the Tribute in the database
        List<Tribute> tributeList = tributeRepository.findAll();
        assertThat(tributeList).hasSize(databaseSizeBeforeUpdate);
        Tribute testTribute = tributeList.get(tributeList.size() - 1);
        assertThat(testTribute.getContent()).isEqualTo(UPDATED_CONTENT);
        assertThat(testTribute.getCreationDate()).isEqualTo(UPDATED_CREATION_DATE);
    }

    @Test
    @Transactional
    void fullUpdateTributeWithPatch() throws Exception {
        // Initialize the database
        tributeRepository.saveAndFlush(tribute);

        int databaseSizeBeforeUpdate = tributeRepository.findAll().size();

        // Update the tribute using partial update
        Tribute partialUpdatedTribute = new Tribute();
        partialUpdatedTribute.setId(tribute.getId());

        partialUpdatedTribute.content(UPDATED_CONTENT).creationDate(UPDATED_CREATION_DATE);

        restTributeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTribute.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedTribute))
            )
            .andExpect(status().isOk());

        // Validate the Tribute in the database
        List<Tribute> tributeList = tributeRepository.findAll();
        assertThat(tributeList).hasSize(databaseSizeBeforeUpdate);
        Tribute testTribute = tributeList.get(tributeList.size() - 1);
        assertThat(testTribute.getContent()).isEqualTo(UPDATED_CONTENT);
        assertThat(testTribute.getCreationDate()).isEqualTo(UPDATED_CREATION_DATE);
    }

    @Test
    @Transactional
    void patchNonExistingTribute() throws Exception {
        int databaseSizeBeforeUpdate = tributeRepository.findAll().size();
        tribute.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTributeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, tribute.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(tribute))
            )
            .andExpect(status().isBadRequest());

        // Validate the Tribute in the database
        List<Tribute> tributeList = tributeRepository.findAll();
        assertThat(tributeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTribute() throws Exception {
        int databaseSizeBeforeUpdate = tributeRepository.findAll().size();
        tribute.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTributeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(tribute))
            )
            .andExpect(status().isBadRequest());

        // Validate the Tribute in the database
        List<Tribute> tributeList = tributeRepository.findAll();
        assertThat(tributeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTribute() throws Exception {
        int databaseSizeBeforeUpdate = tributeRepository.findAll().size();
        tribute.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTributeMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(tribute)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Tribute in the database
        List<Tribute> tributeList = tributeRepository.findAll();
        assertThat(tributeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteTribute() throws Exception {
        // Initialize the database
        tributeRepository.saveAndFlush(tribute);

        int databaseSizeBeforeDelete = tributeRepository.findAll().size();

        // Delete the tribute
        restTributeMockMvc
            .perform(delete(ENTITY_API_URL_ID, tribute.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Tribute> tributeList = tributeRepository.findAll();
        assertThat(tributeList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
