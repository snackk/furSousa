import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IRandomSaying } from '../random-saying.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../random-saying.test-samples';

import { RandomSayingService, RestRandomSaying } from './random-saying.service';

const requireRestSample: RestRandomSaying = {
  ...sampleWithRequiredData,
  creationDate: sampleWithRequiredData.creationDate?.toJSON(),
};

describe('RandomSaying Service', () => {
  let service: RandomSayingService;
  let httpMock: HttpTestingController;
  let expectedResult: IRandomSaying | IRandomSaying[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(RandomSayingService);
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

    it('should create a RandomSaying', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const randomSaying = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(randomSaying).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a RandomSaying', () => {
      const randomSaying = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(randomSaying).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a RandomSaying', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of RandomSaying', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a RandomSaying', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addRandomSayingToCollectionIfMissing', () => {
      it('should add a RandomSaying to an empty array', () => {
        const randomSaying: IRandomSaying = sampleWithRequiredData;
        expectedResult = service.addRandomSayingToCollectionIfMissing([], randomSaying);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(randomSaying);
      });

      it('should not add a RandomSaying to an array that contains it', () => {
        const randomSaying: IRandomSaying = sampleWithRequiredData;
        const randomSayingCollection: IRandomSaying[] = [
          {
            ...randomSaying,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addRandomSayingToCollectionIfMissing(randomSayingCollection, randomSaying);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a RandomSaying to an array that doesn't contain it", () => {
        const randomSaying: IRandomSaying = sampleWithRequiredData;
        const randomSayingCollection: IRandomSaying[] = [sampleWithPartialData];
        expectedResult = service.addRandomSayingToCollectionIfMissing(randomSayingCollection, randomSaying);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(randomSaying);
      });

      it('should add only unique RandomSaying to an array', () => {
        const randomSayingArray: IRandomSaying[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const randomSayingCollection: IRandomSaying[] = [sampleWithRequiredData];
        expectedResult = service.addRandomSayingToCollectionIfMissing(randomSayingCollection, ...randomSayingArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const randomSaying: IRandomSaying = sampleWithRequiredData;
        const randomSaying2: IRandomSaying = sampleWithPartialData;
        expectedResult = service.addRandomSayingToCollectionIfMissing([], randomSaying, randomSaying2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(randomSaying);
        expect(expectedResult).toContain(randomSaying2);
      });

      it('should accept null and undefined values', () => {
        const randomSaying: IRandomSaying = sampleWithRequiredData;
        expectedResult = service.addRandomSayingToCollectionIfMissing([], null, randomSaying, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(randomSaying);
      });

      it('should return initial array if no RandomSaying is added', () => {
        const randomSayingCollection: IRandomSaying[] = [sampleWithRequiredData];
        expectedResult = service.addRandomSayingToCollectionIfMissing(randomSayingCollection, undefined, null);
        expect(expectedResult).toEqual(randomSayingCollection);
      });
    });

    describe('compareRandomSaying', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareRandomSaying(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareRandomSaying(entity1, entity2);
        const compareResult2 = service.compareRandomSaying(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareRandomSaying(entity1, entity2);
        const compareResult2 = service.compareRandomSaying(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareRandomSaying(entity1, entity2);
        const compareResult2 = service.compareRandomSaying(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
