import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ITribute } from '../tribute.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../tribute.test-samples';

import { TributeService, RestTribute } from './tribute.service';

const requireRestSample: RestTribute = {
  ...sampleWithRequiredData,
  creationDate: sampleWithRequiredData.creationDate?.toJSON(),
};

describe('Tribute Service', () => {
  let service: TributeService;
  let httpMock: HttpTestingController;
  let expectedResult: ITribute | ITribute[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(TributeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Tribute', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const tribute = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(tribute).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Tribute', () => {
      const tribute = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(tribute).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Tribute', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Tribute', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Tribute', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addTributeToCollectionIfMissing', () => {
      it('should add a Tribute to an empty array', () => {
        const tribute: ITribute = sampleWithRequiredData;
        expectedResult = service.addTributeToCollectionIfMissing([], tribute);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(tribute);
      });

      it('should not add a Tribute to an array that contains it', () => {
        const tribute: ITribute = sampleWithRequiredData;
        const tributeCollection: ITribute[] = [
          {
            ...tribute,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addTributeToCollectionIfMissing(tributeCollection, tribute);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Tribute to an array that doesn't contain it", () => {
        const tribute: ITribute = sampleWithRequiredData;
        const tributeCollection: ITribute[] = [sampleWithPartialData];
        expectedResult = service.addTributeToCollectionIfMissing(tributeCollection, tribute);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(tribute);
      });

      it('should add only unique Tribute to an array', () => {
        const tributeArray: ITribute[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const tributeCollection: ITribute[] = [sampleWithRequiredData];
        expectedResult = service.addTributeToCollectionIfMissing(tributeCollection, ...tributeArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const tribute: ITribute = sampleWithRequiredData;
        const tribute2: ITribute = sampleWithPartialData;
        expectedResult = service.addTributeToCollectionIfMissing([], tribute, tribute2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(tribute);
        expect(expectedResult).toContain(tribute2);
      });

      it('should accept null and undefined values', () => {
        const tribute: ITribute = sampleWithRequiredData;
        expectedResult = service.addTributeToCollectionIfMissing([], null, tribute, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(tribute);
      });

      it('should return initial array if no Tribute is added', () => {
        const tributeCollection: ITribute[] = [sampleWithRequiredData];
        expectedResult = service.addTributeToCollectionIfMissing(tributeCollection, undefined, null);
        expect(expectedResult).toEqual(tributeCollection);
      });
    });

    describe('compareTribute', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareTribute(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareTribute(entity1, entity2);
        const compareResult2 = service.compareTribute(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareTribute(entity1, entity2);
        const compareResult2 = service.compareTribute(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareTribute(entity1, entity2);
        const compareResult2 = service.compareTribute(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
