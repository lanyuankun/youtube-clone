var RPCClient = require('@alicloud/pop-core').RPCClient;

function initVodClient(accessKeyId, accessKeySecret,) {
    var regionId = 'cn-shanghai';   // 点播服务接入区域
    var client = new RPCClient({
        accessKeyId: accessKeyId,
        accessKeySecret: accessKeySecret,
        endpoint: 'http://vod.' + regionId + '.aliyuncs.com',
        apiVersion: '2017-03-21'
    });
    return client;
}

let vodClient = null;

module.exports = {
    get vodClient() {
        if (!vodClient) {
            let { accessKeyId, accessKeySecret } = this.config.vodClient;
            vodClient = initVodClient(accessKeyId, accessKeySecret)
        }
        return vodClient
    }
}