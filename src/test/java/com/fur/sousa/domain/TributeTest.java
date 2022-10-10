package com.fur.sousa.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.fur.sousa.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class TributeTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Tribute.class);
        Tribute tribute1 = new Tribute();
        tribute1.setId(1L);
        Tribute tribute2 = new Tribute();
        tribute2.setId(tribute1.getId());
        assertThat(tribute1).isEqualTo(tribute2);
        tribute2.setId(2L);
        assertThat(tribute1).isNotEqualTo(tribute2);
        tribute1.setId(null);
        assertThat(tribute1).isNotEqualTo(tribute2);
    }
}
