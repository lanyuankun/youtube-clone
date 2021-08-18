'use strict';

const Controller = require('egg').Controller;


class VodController extends Controller {
    async createUploadVideo(accessKeyId, accessKeySecret) {
        const { ctx } = this;
        const query = ctx.query;
        ctx.validate({ Title: 'string',FileName: 'string'}, query)
        this.ctx.body = await this.app.vodClient.request("CreateUploadVideo", query, {});
    }
    async refreshUploadVideo(accessKeyId, accessKeySecret) {
        const { ctx } = this;
        const query = ctx.query;
        ctx.validate({ VideoId: 'string',}, query)
        this.ctx.body = await this.app.vodClient.request("RefreshUploadVideo", query, {});
    }

}

module.exports = VodController;
