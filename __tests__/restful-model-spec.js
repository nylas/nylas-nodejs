import NylasConnection from '../src/nylas-connection';
import RestfulModel from '../src/models/restful-model';
import Attributes from '../src/models/attributes';

class RestfulSubclassA extends RestfulModel {}

class RestfulSubclassB extends RestfulModel {}

class RestfulSubclassAttributes extends RestfulModel {}
RestfulSubclassAttributes.attributes = {
  ...RestfulModel.attributes,
  testNumber: Attributes.Number({
    modelKey: 'testNumber',
    jsonKey: 'test_number',
  }),
  testBoolean: Attributes.Boolean({
    modelKey: 'testBoolean',
    jsonKey: 'test_boolean',
  }),
};

describe('RestfulModel', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
    testContext.connection = new NylasConnection('token', { clientId: 'foo' });
  });

  test('should throw an exception unless constructed with a connection', () => {
    expect(() => new RestfulModel()).toThrow();
    expect(() => new RestfulModel(testContext.connection)).not.toThrow();
  });

  test('should accept JSON properties', () => {
    const model = new RestfulModel(testContext.connection, {
      object: 'thread',
      id: '123',
    });
    expect(model.object).toBe('thread');
    expect(model.id).toBe('123');
  });

  describe('attributes', () => {
    test('should return the attributes attached to the class', () => {
      const model = new RestfulModel(testContext.connection, {
        object: 'thread',
        id: '123',
      });
      expect(model.attributes()).toBe(model.constructor.attributes);
    });
  });

  describe('isEqual', () => {
    beforeEach(() => {
      testContext.model1 = new RestfulModel(testContext.connection, {
        object: 'thread',
        id: 'A',
      });
      testContext.model2 = new RestfulModel(testContext.connection, {
        object: 'thread',
        id: 'A',
      });
      testContext.model3 = new RestfulModel(testContext.connection, {
        object: 'thread',
        id: 'B',
      });
      testContext.model4 = new RestfulSubclassA(testContext.connection, {
        object: 'thread',
        id: 'B',
      });
      testContext.model5 = new RestfulSubclassB(testContext.connection, {
        object: 'thread',
        id: 'C',
      });
      testContext.model6 = new RestfulSubclassB(testContext.connection, {
        object: 'thread',
        id: 'C',
      });
    });

    test('should return true if the objects are of the same class and have the same id', () => {
      expect(testContext.model1.isEqual(testContext.model2)).toBe(true);
      expect(testContext.model5.isEqual(testContext.model6)).toBe(true);
    });

    test('should return false otherwise', () => {
      expect(testContext.model1.isEqual(testContext.model3)).toBe(false);
      expect(testContext.model3.isEqual(testContext.model4)).toBe(false);
    });
  });

  describe('fromJSON', () => {
    beforeEach(() => {
      testContext.json = {
        id: '1234',
        account_id: '1234',
        test_number: 4,
        test_boolean: true,
        daysOld: 4,
      };
      testContext.m = new RestfulSubclassAttributes(testContext.connection);
    });

    test('should assign attribute values by calling through to attribute fromJSON functions', () => {
      const testNumberFromJSON =
        RestfulSubclassAttributes.attributes.testNumber.fromJSON;
      RestfulSubclassAttributes.attributes.testNumber.fromJSON = jest.fn(
        () => 'inflated value!'
      );
      testContext.m.fromJSON(testContext.json);
      expect(
        RestfulSubclassAttributes.attributes.testNumber.fromJSON.mock.calls
          .length
      ).toBe(1);
      expect(testContext.m.testNumber).toBe('inflated value!');
      RestfulSubclassAttributes.attributes.testNumber.fromJSON = testNumberFromJSON;
    });

    test('should not touch attributes that are missing in the json', () => {
      testContext.m.fromJSON(testContext.json);
      expect(testContext.m.object).toBe(undefined);

      testContext.m.object = 'abc';
      testContext.m.fromJSON(testContext.json);
      expect(testContext.m.object).toBe('abc');
    });

    test('should not do anything with extra JSON keys', () => {
      testContext.m.fromJSON(testContext.json);
      expect(testContext.m.daysOld).toBe(undefined);
    });

    describe('Attributes.Number', () => {
      test('should read number attributes and coerce them to numeric values', () => {
        testContext.m.fromJSON({ test_number: 4 });
        expect(testContext.m.testNumber).toBe(4);

        testContext.m.fromJSON({ test_number: '4' });
        expect(testContext.m.testNumber).toBe(4);

        testContext.m.fromJSON({ test_number: 'lolz' });
        expect(testContext.m.testNumber).toBe(null);

        testContext.m.fromJSON({ test_number: 0 });
        expect(testContext.m.testNumber).toBe(0);
      });
    });

    describe('Attributes.Boolean', () => {
      test('should read `true` or true and coerce everything else to false', () => {
        testContext.m.fromJSON({ test_boolean: true });
        expect(testContext.m.testBoolean).toBe(true);

        testContext.m.fromJSON({ test_boolean: 'true' });
        expect(testContext.m.testBoolean).toBe(true);

        testContext.m.fromJSON({ test_boolean: 4 });
        expect(testContext.m.testBoolean).toBe(false);

        testContext.m.fromJSON({ test_boolean: '4' });
        expect(testContext.m.testBoolean).toBe(false);

        testContext.m.fromJSON({ test_boolean: false });
        expect(testContext.m.testBoolean).toBe(false);

        testContext.m.fromJSON({ test_boolean: 0 });
        expect(testContext.m.testBoolean).toBe(false);

        testContext.m.fromJSON({ test_boolean: null });
        expect(testContext.m.testBoolean).toBe(false);
      });
    });
  });

  describe('toJSON', () => {
    beforeEach(() => {
      testContext.model = new RestfulModel(testContext.connection, {
        id: '1234',
        account_id: 'ACD',
      });
    });

    test('should return a JSON object and call attribute toJSON functions to map values', () => {
      RestfulModel.attributes.accountId.toJSON = jest.fn(
        () => 'inflated value!'
      );

      const json = testContext.model.toJSON();
      expect(json instanceof Object).toBe(true);
      expect(json.id).toBe('1234');
      expect(json.account_id).toBe('inflated value!');
    });

    test('should surface any exception one of the attribute toJSON functions raises', () => {
      RestfulModel.attributes.accountId.toJSON = jest.fn(() => {
        throw new Error("Can't convert value into JSON format");
      });
      expect(() => testContext.model.toJSON()).toThrow();
    });

    test('if enforceReadOnly is set to true, ignore read only values', () => {
      const model = new RestfulModel(testContext.connection, {
        object: 'thread',
        id: '123',
        accountId: '123abc',
      });
      const json = model.toJSON(true);
      expect(json.id).toBeUndefined();
      expect(json.object).toBeUndefined();
      expect(json.account_id).toBeUndefined();
    });
  });
});
