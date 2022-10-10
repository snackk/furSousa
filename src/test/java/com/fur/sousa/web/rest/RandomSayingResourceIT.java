package com.fur.sousa.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fur.sousa.IntegrationTest;
import com.fur.sousa.domain.RandomSaying;
import com.fur.sousa.repository.RandomSayingRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link RandomSayingResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class RandomSayingResourceIT {

    private static final String DEFAULT_CONTENT = "AAAAAAAAAA";
    private static final String UPDATED_CONTENT = "BBBBBBBBBB";

    private static final Instant DEFAULT_CREATION_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATION_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/random-sayings";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private RandomSayingRepository randomSayingRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restRandomSayingMockMvc;

    private RandomSaying randomSaying;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static RandomSaying createEntity(EntityManager em) {
        RandomSaying randomSaying = new RandomSaying().content(DEFAULT_CONTENT).creationDate(DEFAULT_CREATION_DATE);
        return randomSaying;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static RandomSaying createUpdatedEntity(EntityManager em) {
        RandomSaying randomSaying = new RandomSaying().content(UPDATED_CONTENT).creationDate(UPDATED_CREATION_DATE);
        return randomSaying;
    }

    @BeforeEach
    public void initTest() {
        randomSaying = createEntity(em);
    }

    @Test
    @Transactional
    void createRandomSaying() throws Exception {
        int databaseSizeBeforeCreate = randomSayingRepository.findAll().size();
        // Create the RandomSaying
        restRandomSayingMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(randomSaying)))
            .andExpect(status().isCreated());

        // Validate the RandomSaying in the database
        List<RandomSaying> randomSayingList = randomSayingRepository.findAll();
        assertThat(randomSayingList).hasSize(databaseSizeBeforeCreate + 1);
        RandomSaying testRandomSaying = randomSayingList.get(randomSayingList.size() - 1);
        assertThat(testRandomSaying.getContent()).isEqualTo(DEFAULT_CONTENT);
        assertThat(testRandomSaying.getCreationDate()).isEqualTo(DEFAULT_CREATION_DATE);
    }

    @Test
    @Transactional
    void createRandomSayingWithExistingId() throws Exception {
        // Create the RandomSaying with an existing ID
        randomSaying.setId(1L);

        int databaseSizeBeforeCreate = randomSayingRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restRandomSayingMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(randomSaying)))
            .andExpect(status().isBadRequest());

        // Validate the RandomSaying in the database
        List<RandomSaying> randomSayingList = randomSayingRepository.findAll();
        assertThat(randomSayingList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkContentIsRequired() throws Exception {
        int databaseSizeBeforeTest = randomSayingRepository.findAll().size();
        // set the field null
        randomSaying.setContent(null);

        // Create the RandomSaying, which fails.

        restRandomSayingMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(randomSaying)))
            .andExpect(status().isBadRequest());

        List<RandomSaying> randomSayingList = randomSayingRepository.findAll();
        assertThat(randomSayingList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllRandomSayings() throws Exception {
        // Initialize the database
        randomSayingRepository.saveAndFlush(randomSaying);

        // Get all the randomSayingList
        restRandomSayingMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(randomSaying.getId().intValue())))
            .andExpect(jsonPath("$.[*].content").value(hasItem(DEFAULT_CONTENT)))
            .andExpect(jsonPath("$.[*].creationDate").value(hasItem(DEFAULT_CREATION_DATE.toString())));
    }

    @Test
    @Transactional
    void getRandomSaying() throws Exception {
        // Initialize the database
        randomSayingRepository.saveAndFlush(randomSaying);

        // Get the randomSaying
        restRandomSayingMockMvc
            .perform(get(ENTITY_API_URL_ID, randomSaying.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(randomSaying.getId().intValue()))
            .andExpect(jsonPath("$.content").value(DEFAULT_CONTENT))
            .andExpect(jsonPath("$.creationDate").value(DEFAULT_CREATION_DATE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingRandomSaying() throws Exception {
        // Get the randomSaying
        restRandomSayingMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingRandomSaying() throws Exception {
        // Initialize the database
        randomSayingRepository.saveAndFlush(randomSaying);

        int databaseSizeBeforeUpdate = randomSayingRepository.findAll().size();

        // Update the randomSaying
        RandomSaying updatedRandomSaying = randomSayingRepository.findById(randomSaying.getId()).get();
        // Disconnect from session so that the updates on updatedRandomSaying are not directly saved in db
        em.detach(updatedRandomSaying);
        updatedRandomSaying.content(UPDATED_CONTENT).creationDate(UPDATED_CREATION_DATE);

        restRandomSayingMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedRandomSaying.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedRandomSaying))
            )
            .andExpect(status().isOk());

        // Validate the RandomSaying in the database
        List<RandomSaying> randomSayingList = randomSayingRepository.findAll();
        assertThat(randomSayingList).hasSize(databaseSizeBeforeUpdate);
        RandomSaying testRandomSaying = randomSayingList.get(randomSayingList.size() - 1);
        assertThat(testRandomSaying.getContent()).isEqualTo(UPDATED_CONTENT);
        assertThat(testRandomSaying.getCreationDate()).isEqualTo(UPDATED_CREATION_DATE);
    }

    @Test
    @Transactional
    void putNonExistingRandomSaying() throws Exception {
        int databaseSizeBeforeUpdate = randomSayingRepository.findAll().size();
        randomSaying.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRandomSayingMockMvc
            .perform(
                put(ENTITY_API_URL_ID, randomSaying.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(randomSaying))
            )
            .andExpect(status().isBadRequest());

        // Validate the RandomSaying in the database
        List<RandomSaying> randomSayingList = randomSayingRepository.findAll();
        assertThat(randomSayingList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchRandomSaying() throws Exception {
        int databaseSizeBeforeUpdate = randomSayingRepository.findAll().size();
        randomSaying.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRandomSayingMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(randomSaying))
            )
            .andExpect(status().isBadRequest());

        // Validate the RandomSaying in the database
        List<RandomSaying> randomSayingList = randomSayingRepository.findAll();
        assertThat(randomSayingList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamRandomSaying() throws Exception {
        int databaseSizeBeforeUpdate = randomSayingRepository.findAll().size();
        randomSaying.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRandomSayingMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(randomSaying)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the RandomSaying in the database
        List<RandomSaying> randomSayingList = randomSayingRepository.findAll();
        assertThat(randomSayingList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateRandomSayingWithPatch() throws Exception {
        // Initialize the database
        randomSayingRepository.saveAndFlush(randomSaying);

        int databaseSizeBeforeUpdate = randomSayingRepository.findAll().size();

        // Update the randomSaying using partial update
        RandomSaying partialUpdatedRandomSaying = new RandomSaying();
        partialUpdatedRandomSaying.setId(randomSaying.getId());

        partialUpdatedRandomSaying.content(UPDATED_CONTENT).creationDate(UPDATED_CREATION_DATE);

        restRandomSayingMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRandomSaying.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedRandomSaying))
            )
            .andExpect(status().isOk());

        // Validate the RandomSaying in the database
        List<RandomSaying> randomSayingList = randomSayingRepository.findAll();
        assertThat(randomSayingList).hasSize(databaseSizeBeforeUpdate);
        RandomSaying testRandomSaying = randomSayingList.get(randomSayingList.size() - 1);
        assertThat(testRandomSaying.getContent()).isEqualTo(UPDATED_CONTENT);
        assertThat(testRandomSaying.getCreationDate()).isEqualTo(UPDATED_CREATION_DATE);
    }

    @Test
    @Transactional
    void fullUpdateRandomSayingWithPatch() throws Exception {
        // Initialize the database
        randomSayingRepository.saveAndFlush(randomSaying);

        int databaseSizeBeforeUpdate = randomSayingRepository.findAll().size();

        // Update the randomSaying using partial update
        RandomSaying partialUpdatedRandomSaying = new RandomSaying();
        partialUpdatedRandomSaying.setId(randomSaying.getId());

        partialUpdatedRandomSaying.content(UPDATED_CONTENT).creationDate(UPDATED_CREATION_DATE);

        restRandomSayingMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRandomSaying.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedRandomSaying))
            )
            .andExpect(status().isOk());

        // Validate the RandomSaying in the database
        List<RandomSaying> randomSayingList = randomSayingRepository.findAll();
        assertThat(randomSayingList).hasSize(databaseSizeBeforeUpdate);
        RandomSaying testRandomSaying = randomSayingList.get(randomSayingList.size() - 1);
        assertThat(testRandomSaying.getContent()).isEqualTo(UPDATED_CONTENT);
        assertThat(testRandomSaying.getCreationDate()).isEqualTo(UPDATED_CREATION_DATE);
    }

    @Test
    @Transactional
    void patchNonExistingRandomSaying() throws Exception {
        int databaseSizeBeforeUpdate = randomSayingRepository.findAll().size();
        randomSaying.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRandomSayingMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, randomSaying.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(randomSaying))
            )
            .andExpect(status().isBadRequest());

        // Validate the RandomSaying in the database
        List<RandomSaying> randomSayingList = randomSayingRepository.findAll();
        assertThat(randomSayingList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchRandomSaying() throws Exception {
        int databaseSizeBeforeUpdate = randomSayingRepository.findAll().size();
        randomSaying.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRandomSayingMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(randomSaying))
            )
            .andExpect(status().isBadRequest());

        // Validate the RandomSaying in the database
        List<RandomSaying> randomSayingList = randomSayingRepository.findAll();
        assertThat(randomSayingList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamRandomSaying() throws Exception {
        int databaseSizeBeforeUpdate = randomSayingRepository.findAll().size();
        randomSaying.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRandomSayingMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(randomSaying))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the RandomSaying in the database
        List<RandomSaying> randomSayingList = randomSayingRepository.findAll();
        assertThat(randomSayingList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteRandomSaying() throws Exception {
        // Initialize the database
        randomSayingRepository.saveAndFlush(randomSaying);

        int databaseSizeBeforeDelete = randomSayingRepository.findAll().size();

        // Delete the randomSaying
        restRandomSayingMockMvc
            .perform(delete(ENTITY_API_URL_ID, randomSaying.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<RandomSaying> randomSayingList = randomSayingRepository.findAll();
        assertThat(randomSayingList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
