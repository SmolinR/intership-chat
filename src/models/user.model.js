const { Schema } = require('mongoose');
const connections = require('../config/connection');

const UserSchema = new Schema(
  {
    name: {
      type: String,
    },
    password: {
      type: String,
    },
    socketId: {
      type: String,
    },
    offlineTime: {
      type: Number,
    },
  },
  {
    collection: 'chatusermodel',
    versionKey: false,
  },
);

module.exports = connections.model('UserModel', UserSchema);
