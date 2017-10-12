const _ = require('underscore');
const clone = require('clone');
const request = require('request');
const Promise = require('bluebird');
const RestfulModel = require('./models/restful-model');
const RestfulModelCollection = require('./models/restful-model-collection');
const RestfulModelInstance = require('./models/restful-model-instance');
const Account = require('./models/account');
const ManagementAccount = require('./models/management-account');
const ManagementModelCollection = require('./models/management-model-collection');
const Thread = require('./models/thread');
const Contact = require('./models/contact');
const Message = require('./models/message');
const Draft = require('./models/draft');
const File = require('./models/file');
const Calendar = require('./models/calendar');
const Event = require('./models/event');
const Tag = require('./models/tag');
const Delta = require('./models/delta');
const { Label } = require('./models/folder');
const { Folder } = require('./models/folder');

const Attributes = require('./models/attributes');

const PACKAGE_JSON = require('../package.json');
const SDK_VERSION = PACKAGE_JSON.version;

export default class NylasConnection {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.threads = new RestfulModelCollection(Thread, this);
    this.contacts = new RestfulModelCollection(Contact, this);
    this.messages = new RestfulModelCollection(Message, this);
    this.drafts = new RestfulModelCollection(Draft, this);
    this.files = new RestfulModelCollection(File, this);
    this.calendars = new RestfulModelCollection(Calendar, this);
    this.events = new RestfulModelCollection(Event, this);
    this.tags = new RestfulModelCollection(Tag, this);
    this.deltas = new Delta(this);
    this.labels = new RestfulModelCollection(Label, this);
    this.folders = new RestfulModelCollection(Folder, this);
    this.account = new RestfulModelInstance(Account, this);
  }

  requestOptions(options) {
    if (!options) {
      options = {};
    }
    options = clone(options);
    const Nylas = require('./nylas');
    if (!options.method) {
      options.method = 'GET';
    }
    if (options.path) {
      if (!options.url) {
        options.url = `${Nylas.apiServer}${options.path}`;
      }
    }
    if (!options.formData) {
      if (!options.body) {
        options.body = {};
      }
    }
    if (!options.json) {
      options.json = true;
    }
    if (!options.downloadRequest) {
      options.downloadRequest = false;
    }

    // For convenience, If `expanded` param is provided, convert to view:
    // 'expanded' api option
    if (options.qs && options.qs.expanded) {
      if (options.qs.expanded === true) {
        options.qs.view = 'expanded';
      }
      delete options.qs.expanded;
    }

    const user =
      options.path.substr(0, 3) === '/a/' ? Nylas.appSecret : this.accessToken;

    if (user) {
      options.auth = {
        user: user,
        pass: '',
        sendImmediately: true,
      };
    }

    if (options.headers == null) {
      options.headers = {};
    }
    if (options.headers['User-Agent'] == null) {
      options.headers['User-Agent'] = `Nylas Node SDK v${SDK_VERSION}`;
    }

    return options;
  }

  request(options) {
    if (!options) {
      options = {};
    }
    options = this.requestOptions(options);

    return new Promise(function(resolve, reject) {
      return request(options, function(error, response, body) {
        if (error || response.statusCode > 299) {
          if (!error) {
            error = new Error(body.message);
          }
          return reject(error);
        } else {
          if (options.downloadRequest) {
            return resolve(response);
          } else {
            try {
              if (_.isString(body)) {
                body = JSON.parse(body);
              }
              return resolve(body);
            } catch (error1) {
              error = error1;
              return reject(error);
            }
          }
        }
      });
    });
  }
}
