"use strict";

const Constants = require("../../../Constants");
const Events = Constants.Events;
const Endpoints = Constants.Endpoints;
const apiRequest = require("../../../core/ApiRequest");

module.exports = function(guildId, userId) {
  return new Promise((rs, rj) => {
    apiRequest
    .patch(this, {
      url: `${Endpoints.GUILDS}/${guildId}`,
      body: {owner_id: userId}
    })
    .send((err, res) => {
      if (err || !res.ok)
        return rj(err);

      this._guilds.update(res.body);
      rs(res.body);
    });
  });
};
