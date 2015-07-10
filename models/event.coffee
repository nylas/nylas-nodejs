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

    'busy': Attributes.Boolean
      modelKey: 'busy'

    'title': Attributes.String
      modelKey: 'title'

    'description': Attributes.String
      modelKey: 'description'

    'location': Attributes.String
      modelKey: 'location'

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

  save: (params = {}, callback = null) ->
    if _.isFunction(params)
      callback = params
      params = {}

    @connection.request
      method: if @id then 'PUT' else 'POST'
      body: @toJSON()
      qs: params
      path: if @id then "/n/#{@namespaceId}/events/#{@id}" else "/n/#{@namespaceId}/events"
    .then (json) =>
      @fromJSON(json)
      callback(null, @) if callback
      Promise.resolve(@)
    .catch (err) ->
      callback(err) if callback
      Promise.reject(err)

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
