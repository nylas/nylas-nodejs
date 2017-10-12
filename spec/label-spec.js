import Promise from 'bluebird';
import request from 'request';
import _ from 'underscore';

import Nylas from '../src/nylas';
import NylasConnection from '../src/nylas-connection';
import Message =from '../src/models/message';
import { Label } from '../src/models/folder';


const testUntil = function(fn) {
  let finished = false;
  runs(() =>
    fn(callback => finished = true)
  );
  waitsFor(() => finished);
};

describe("Label", function() {
  beforeEach(function() {
    this.connection = new NylasConnection('123');
    this.label = new Label(this.connection);
    this.label.displayName = 'Label name';
    this.label.name = 'Longer label name';
    return Promise.onPossiblyUnhandledRejection(function(e, promise) {});
  });

  describe("save", function() {
    it("should do a POST request if id is undefined", function() {
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.label.save();
      expect(this.connection.request).toHaveBeenCalledWith({
        method : 'POST',
        body : {
          display_name: 'Label name',
          name: 'Longer label name'
        },
        qs : {},
        path : '/labels'
      });
    });

    it("should do a PUT if id is defined", function() {
      this.label.id = 'label_id';
      spyOn(this.connection, 'request').andCallFake(() => Promise.resolve());
      this.label.save();
      expect(this.connection.request).toHaveBeenCalledWith({
        method : 'PUT',
        body : {
          display_name: 'Label name',
          name: 'Longer label name'
        },
        qs : {},
        path : '/labels/label_id'
      });
    });
  });
});
