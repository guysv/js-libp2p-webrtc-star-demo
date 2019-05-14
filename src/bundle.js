const TCP = require("libp2p-tcp")
const Mplex = require("libp2p-mplex")
const Libp2p = require("libp2p")

const wrtc = require("wrtc")
const WebRTCStar = require("libp2p-webrtc-star/src/factory")

class Node extends Libp2p {
  constructor (options) {
    options = options || {}

    options.modules = {
      transport: [TCP, WebRTCStar({wrtc})],
      streamMuxer: [Mplex]
    }
    super(options)
  }
}

module.exports = Node
