import {
  entityTableSelector,
  entityDetailsButtonSelector,
  entityDetailsBackButtonSelector,
  entityCreateButtonSelector,
  entityCreateSaveButtonSelector,
  entityCreateCancelButtonSelector,
  entityEditButtonSelector,
  entityDeleteButtonSelector,
  entityConfirmDeleteButtonSelector,
} from '../../support/entity';

describe('RandomSaying e2e test', () => {
  const randomSayingPageUrl = '/random-saying';
  const randomSayingPageUrlPattern = new RegExp('/random-saying(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const randomSayingSample = { content: 'Texas Soft green' };

  let randomSaying;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/random-sayings+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/random-sayings').as('postEntityRequest');
    cy.intercept('DELETE', '/api/random-sayings/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (randomSaying) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/random-sayings/${randomSaying.id}`,
      }).then(() => {
        randomSaying = undefined;
      });
    }
  });

  it('RandomSayings menu should load RandomSayings page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('random-saying');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('RandomSaying').should('exist');
    cy.url().should('match', randomSayingPageUrlPattern);
  });

  describe('RandomSaying page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(randomSayingPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create RandomSaying page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/random-saying/new$'));
        cy.getEntityCreateUpdateHeading('RandomSaying');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should('match', randomSayingPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/random-sayings',
          body: randomSayingSample,
        }).then(({ body }) => {
          randomSaying = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/random-sayings+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/random-sayings?page=0&size=20>; rel="last",<http://localhost/api/random-sayings?page=0&size=20>; rel="first"',
              },
              body: [randomSaying],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(randomSayingPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details RandomSaying page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('randomSaying');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should('match', randomSayingPageUrlPattern);
      });

      it('edit button click should load edit RandomSaying page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('RandomSaying');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should('match', randomSayingPageUrlPattern);
      });

      it('edit button click should load edit RandomSaying page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('RandomSaying');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should('match', randomSayingPageUrlPattern);
      });

      it('last delete button click should delete instance of RandomSaying', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('randomSaying').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should('match', randomSayingPageUrlPattern);

        randomSaying = undefined;
      });
    });
  });

  describe('new RandomSaying page', () => {
    beforeEach(() => {
      cy.visit(`${randomSayingPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('RandomSaying');
    });

    it('should create an instance of RandomSaying', () => {
      cy.get(`[data-cy="content"]`).type('Run').should('have.value', 'Run');

      cy.get(`[data-cy="creationDate"]`).type('2022-10-10T08:21').blur().should('have.value', '2022-10-10T08:21');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response.statusCode).to.equal(201);
        randomSaying = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response.statusCode).to.equal(200);
      });
      cy.url().should('match', randomSayingPageUrlPattern);
    });
  });
});
