_ = require 'underscore'

Tag = require './tag'
Message = require './message'
RestfulModel = require './restful-model'
Contact = require './contact'
Attributes = require './attributes'
Label = require('./folder').Label
Folder = require('./folder').Folder

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

    'starred': Attributes.Boolean
      queryable: true
      modelKey: 'starred'

    'messageIds': Attributes.StringList
      modelKey: 'messageIds'
      jsonKey: 'message_ids'

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

    'labels': Attributes.Collection
      modelKey: 'labels'
      itemClass: Label

    'folder': Attributes.Object
      modelKey: 'folder'
      itemClass: Folder

  fromJSON: (json) =>
    super(json)
    @unread = @isUnread()
    @

  saveRequestBody: ->
    json = {}
    if @labels?
      json['labels'] = (label.id for label in @labels)
    else if @folder?
      json['folder'] = @folder.id

    json['starred'] = @starred
    json['unread'] = @unread
    json

  save: (params = {}, callback = null) =>
    this._save(params, callback)

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
