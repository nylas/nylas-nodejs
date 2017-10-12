import Promise from 'bluebird';
import request from 'request';
import _ from 'underscore';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import RestfulModel from '../src/models/restful-model';
import Attributes from '../src/models/attributes';

class RestfulSubclassA extends RestfulModel {}

class RestfulSubclassB extends RestfulModel {}

class RestfulSubclassAttributes extends RestfulModel {
  constructor() {
    super();
    this.attributes = _.extend({}, RestfulModel.attributes, {
      testNumber: Attributes.Number({
        modelKey: 'testNumber',
        jsonKey: 'test_number',
      }),
      testBoolean: Attributes.Boolean({
        modelKey: 'testBoolean',
        jsonKey: 'test_boolean',
      }),
    });
  }
}

describe('RestfulModel', function() {
  beforeEach(function() {
    this.connection = new NylasConnection('token');
  });

  it('should throw an exception unless constructed with a connection', function() {
    expect(() => new RestfulModel()).toThrow();
    expect(() => new RestfulModel(this.connection)).not.toThrow();
  });

  it('should accept JSON properties', function() {
    const model = new RestfulModel(this.connection, {
      object: 'thread',
      id: '123',
    });
    expect(model.object).toBe('thread');
    expect(model.id).toBe('123');
  });

  describe('attributes', () =>
    it('should return the attributes attached to the class', function() {
      const model = new RestfulModel(this.connection, {
        object: 'thread',
        id: '123',
      });
      expect(model.attributes()).toBe(model.constructor.attributes);
    }));

  describe('isEqual', function() {
    beforeEach(function() {
      this.model1 = new RestfulModel(this.connection, {
        object: 'thread',
        id: 'A',
      });
      this.model2 = new RestfulModel(this.connection, {
        object: 'thread',
        id: 'A',
      });
      this.model3 = new RestfulModel(this.connection, {
        object: 'thread',
        id: 'B',
      });
      this.model4 = new RestfulSubclassA(this.connection, {
        object: 'thread',
        id: 'B',
      });
      this.model5 = new RestfulSubclassB(this.connection, {
        object: 'thread',
        id: 'C',
      });
      this.model6 = new RestfulSubclassB(this.connection, {
        object: 'thread',
        id: 'C',
      });
    });

    it('should return true if the objects are of the same class and have the same id', function() {
      expect(this.model1.isEqual(this.model2)).toBe(true);
      expect(this.model5.isEqual(this.model6)).toBe(true);
    });

    it('should return false otherwise', function() {
      expect(this.model1.isEqual(this.model3)).toBe(false);
      expect(this.model3.isEqual(this.model4)).toBe(false);
    });
  });

  describe('fromJSON', function() {
    beforeEach(function() {
      this.json = {
        id: '1234',
        account_id: '1234',
        test_number: 4,
        test_boolean: true,
        daysOld: 4,
      };
      this.m = new RestfulSubclassAttributes(this.connection);
    });

    it('should assign attribute values by calling through to attribute fromJSON functions', function() {
      spyOn(
        RestfulSubclassAttributes.attributes.testNumber,
        'fromJSON'
      ).andCallFake(json => 'inflated value!');
      this.m.fromJSON(this.json);
      expect(
        RestfulSubclassAttributes.attributes.testNumber.fromJSON.callCount
      ).toBe(1);
      expect(this.m.testNumber).toBe('inflated value!');
    });

    it('should not touch attributes that are missing in the json', function() {
      this.m.fromJSON(this.json);
      expect(this.m.object).toBe(undefined);

      this.m.object = 'abc';
      this.m.fromJSON(this.json);
      expect(this.m.object).toBe('abc');
    });

    it('should not do anything with extra JSON keys', function() {
      this.m.fromJSON(this.json);
      expect(this.m.daysOld).toBe(undefined);
    });

    describe('Attributes.Number', () =>
      it('should read number attributes and coerce them to numeric values', function() {
        this.m.fromJSON({ test_number: 4 });
        expect(this.m.testNumber).toBe(4);

        this.m.fromJSON({ test_number: '4' });
        expect(this.m.testNumber).toBe(4);

        this.m.fromJSON({ test_number: 'lolz' });
        expect(this.m.testNumber).toBe(null);

        this.m.fromJSON({ test_number: 0 });
        expect(this.m.testNumber).toBe(0);
      }));

    describe('Attributes.Boolean', () =>
      it('should read `true` or true and coerce everything else to false', function() {
        this.m.fromJSON({ test_boolean: true });
        expect(this.m.testBoolean).toBe(true);

        this.m.fromJSON({ test_boolean: 'true' });
        expect(this.m.testBoolean).toBe(true);

        this.m.fromJSON({ test_boolean: 4 });
        expect(this.m.testBoolean).toBe(false);

        this.m.fromJSON({ test_boolean: '4' });
        expect(this.m.testBoolean).toBe(false);

        this.m.fromJSON({ test_boolean: false });
        expect(this.m.testBoolean).toBe(false);

        this.m.fromJSON({ test_boolean: 0 });
        expect(this.m.testBoolean).toBe(false);

        this.m.fromJSON({ test_boolean: null });
        expect(this.m.testBoolean).toBe(false);
      }));
  });

  describe('toJSON', function() {
    beforeEach(function() {
      this.model = new RestfulModel(this.connection, {
        id: '1234',
        account_id: 'ACD',
      });
    });

    it('should return a JSON object and call attribute toJSON functions to map values', function() {
      spyOn(RestfulModel.attributes.accountId, 'toJSON').andCallFake(
        json => 'inflated value!'
      );

      const json = this.model.toJSON();
      expect(json instanceof Object).toBe(true);
      expect(json.id).toBe('1234');
      expect(json.account_id).toBe('inflated value!');
    });

    it('should surface any exception one of the attribute toJSON functions raises', function() {
      spyOn(RestfulModel.attributes.accountId, 'toJSON').andCallFake(function(
        json
      ) {
        throw new Error("Can't convert value into JSON format");
      });
      expect(function() {
        return this.model.toJSON();
      }).toThrow();
    });
  });
});
