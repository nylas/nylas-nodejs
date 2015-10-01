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

  upload: (callback = null) =>
    throw new Error("Please define a filename") if not @filename
    throw new Error("Please add some data to the file") if not @data
    throw new Error("Please define a content-type") if not @contentType

    @connection.request
      method: 'POST'
      json: false
      path: "/#{@constructor.collectionName}"
      formData:
        file:
          value: @data
          options:
            filename: @filename
            contentType: @contentType

    .then (json) =>
      # The API returns a list of files. It should
      # always have a length of 1 since we only
      # upload file-by-file.
      if json.length > 0
          @fromJSON(json[0])
          callback(null, @) if callback
          Promise.resolve(@)
      else
        Promise.reject(null)
    .catch (err) ->
      callback(err) if callback
      Promise.reject(err)
