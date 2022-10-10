package com.fur.sousa.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.fur.sousa.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class RandomSayingTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(RandomSaying.class);
        RandomSaying randomSaying1 = new RandomSaying();
        randomSaying1.setId(1L);
        RandomSaying randomSaying2 = new RandomSaying();
        randomSaying2.setId(randomSaying1.getId());
        assertThat(randomSaying1).isEqualTo(randomSaying2);
        randomSaying2.setId(2L);
        assertThat(randomSaying1).isNotEqualTo(randomSaying2);
        randomSaying1.setId(null);
        assertThat(randomSaying1).isNotEqualTo(randomSaying2);
    }
}
