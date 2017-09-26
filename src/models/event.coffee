RestfulModel = require './restful-model'
Attributes = require './attributes'
Participant = require './participant'
Promise = require 'bluebird'
_ = require 'underscore'

module.exports =
class Event extends RestfulModel

  @collectionName: 'events'

  @attributes: _.extend {}, RestfulModel.attributes,

    'calendarId': Attributes.String
      modelKey: 'calendarId'
      jsonKey: 'calendar_id'

    'account_id': Attributes.String
      modelKey: 'account_id'

    'master_event_id': Attributes.String
      modelKey: 'master_event_id'

    'busy': Attributes.Boolean
      modelKey: 'busy'

    'title': Attributes.String
      modelKey: 'title'

    'description': Attributes.String
      modelKey: 'description'

    'status': Attributes.String
      modelKey: 'status'

    'location': Attributes.String
      modelKey: 'location'

    'recurrence': Attributes.Object
      modelKey: 'recurrence'

    'owner': Attributes.String
      modelKey: 'owner'

    'original_start_time': Attributes.Number
      modelKey: 'original_start_time'

    'when': Attributes.Object
      modelKey: 'when'

    'start': Attributes.Number
      modelKey: 'start'
      jsonKey: '_start'

    'end': Attributes.Number
      modelKey: 'end'
      jsonKey: '_end'

    'participants': Attributes.Collection
      modelKey: 'participants'
      itemClass: Participant

  saveRequestBody: ->
    dct = @toJSON()
    if @start? and @end?
        dct['when'] = {start_time: @start.toString(), end_time: @end.toString()}
    delete dct['_start']
    delete dct['_end']
    dct

  save: (params = {}, callback = null) =>
    this._save(params, callback)

  fromJSON: (json) ->
    super(json)

    if @when?
      # For indexing and querying purposes, we flatten the start and end of the different
      # "when" formats into two timestamps we can use for range querying. Note that for
      # all-day events, we use first second of start date and last second of end date.
      @start = @when.start_time || new Date(@when.start_date).getTime()/1000.0 || @when.time
      @end = @when.end_time || new Date(@when.end_date).getTime()/1000.0+(60*60*24-1) || @when.time
      delete @when.object
    @

  rsvp: (status, comment, callback) ->
    @connection.request
      method: 'POST'
      body: { 'event_id': @id, 'status': status, 'comment': comment }
      path: "/send-rsvp"
    .then (json) =>
      @fromJSON(json)
      callback(null, @) if callback
      Promise.resolve(@)
    .catch (err) ->
      callback(err) if callback
      Promise.reject(err)
