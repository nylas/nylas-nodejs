_ = require 'underscore'

Tag = require './tag'
RestfulModel = require './restful-model'
Contact = require './contact'
Attributes = require './attributes'

module.exports =
class Thread extends RestfulModel

  @collectionName: 'threads'

  @attributes: _.extend {}, RestfulModel.attributes,

    'snippet': Attributes.String
      modelKey: 'snippet'

    'subject': Attributes.String
      modelKey: 'subject'

    'unread': Attributes.Boolean
      queryable: true
      modelKey: 'unread'

    'tags': Attributes.Collection
      queryable: true
      modelKey: 'tags'
      itemClass: Tag

    'participants': Attributes.Collection
      modelKey: 'participants'
      itemClass: Contact

    'lastMessageTimestamp': Attributes.DateTime
      queryable: true
      modelKey: 'lastMessageTimestamp'
      jsonKey: 'last_message_timestamp'

  fromJSON: (json) =>
    super(json)
    @unread = @isUnread()
    @

  tagIds: =>
    _.map @tags, (tag) -> tag.id

  isUnread: ->
    @tagIds().indexOf('unread') != -1

  isStarred: ->
    @tagIds().indexOf('starred') != -1

  markAsRead: ->

  star: ->
    @addRemoveTags(['starred'], [])

  unstar: ->
    @addRemoveTags([], ['starred'])

  toggleStar: ->
    if @isStarred()
      @unstar()
    else
      @star()

  archive: ->
    @addRemoveTags(['archive'], ['inbox'])

  unarchive: ->
    @addRemoveTags(['inbox'], ['archive'])

  addRemoveTags: (tagIdsToAdd, tagIdsToRemove) ->

