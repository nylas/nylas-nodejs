RestfulModel = require './restful-model'
Attributes = require './attributes'
_ = require 'underscore'

module.exports =
class File extends RestfulModel

  @collectionName: 'files'

  @attributes: _.extend {}, RestfulModel.attributes,
    'filename': Attributes.String
      modelKey: 'filename'
      jsonKey: 'filename'

    'size': Attributes.Number
      modelKey: 'size'
      jsonKey: 'size'

    'contentType': Attributes.String
      modelKey: 'contentType'
      jsonKey: 'content_type'

    'messageIds': Attributes.Collection
      modelKey: 'messageIds'
      jsonKey: 'message_ids'
      itemClass: String

    'contentId': Attributes.String
      modelKey: 'contentId'
      jsonKey: 'content_id'
