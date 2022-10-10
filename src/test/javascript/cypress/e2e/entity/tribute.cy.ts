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

describe('Tribute e2e test', () => {
  const tributePageUrl = '/tribute';
  const tributePageUrlPattern = new RegExp('/tribute(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const tributeSample = { content: 'Indian Georgia' };

  let tribute;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/tributes+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/tributes').as('postEntityRequest');
    cy.intercept('DELETE', '/api/tributes/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (tribute) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/tributes/${tribute.id}`,
      }).then(() => {
        tribute = undefined;
      });
    }
  });

  it('Tributes menu should load Tributes page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('tribute');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Tribute').should('exist');
    cy.url().should('match', tributePageUrlPattern);
  });

  describe('Tribute page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(tributePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Tribute page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/tribute/new$'));
        cy.getEntityCreateUpdateHeading('Tribute');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should('match', tributePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/tributes',
          body: tributeSample,
        }).then(({ body }) => {
          tribute = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/tributes+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/tributes?page=0&size=20>; rel="last",<http://localhost/api/tributes?page=0&size=20>; rel="first"',
              },
              body: [tribute],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(tributePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Tribute page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('tribute');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should('match', tributePageUrlPattern);
      });

      it('edit button click should load edit Tribute page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Tribute');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should('match', tributePageUrlPattern);
      });

      it('edit button click should load edit Tribute page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Tribute');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should('match', tributePageUrlPattern);
      });

      it('last delete button click should delete instance of Tribute', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('tribute').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response.statusCode).to.equal(200);
        });
        cy.url().should('match', tributePageUrlPattern);

        tribute = undefined;
      });
    });
  });

  describe('new Tribute page', () => {
    beforeEach(() => {
      cy.visit(`${tributePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Tribute');
    });

    it('should create an instance of Tribute', () => {
      cy.get(`[data-cy="content"]`).type('Planner productize').should('have.value', 'Planner productize');

      cy.get(`[data-cy="creationDate"]`).type('2022-10-10T12:25').blur().should('have.value', '2022-10-10T12:25');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response.statusCode).to.equal(201);
        tribute = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response.statusCode).to.equal(200);
      });
      cy.url().should('match', tributePageUrlPattern);
    });
  });
});
