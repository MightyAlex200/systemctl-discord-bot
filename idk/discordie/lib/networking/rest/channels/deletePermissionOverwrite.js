"use strict";

const Constants = require("../../../Constants");
const Events = Constants.Events;
const Endpoints = Constants.Endpoints;
const apiRequest = require("../../../core/ApiRequest");

module.exports = function(channelId, overwriteId) {
  return new Promise((rs, rj) => {
    apiRequest
    .del(this, `${Endpoints.CHANNEL_PERMISSIONS(channelId)}/${overwriteId}`)
    .send((err, res) => {
      return (!err && res.ok) ? rs() : rj(err);
    });
  });
};
