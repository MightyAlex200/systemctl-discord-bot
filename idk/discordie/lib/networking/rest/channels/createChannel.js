"use strict";

const Constants = require("../../../Constants");
const Events = Constants.Events;
const Endpoints = Constants.Endpoints;
const apiRequest = require("../../../core/ApiRequest");

module.exports = function(guildId, type, name) {
  return new Promise((rs, rj) => {
    apiRequest
    .post(this,{
      url: Endpoints.GUILD_CHANNELS(guildId),
      body: {
        type: type,
        name: name
      }
    })
    .send((err, res) => {
      if (err || !res.ok)
        return rj(err);

      this._channels.update(res.body);
      rs(res.body);
    });
  });
};
