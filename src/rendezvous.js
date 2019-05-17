'use strict'
/* eslint-disable no-console */

/*
 * Listener Node
 */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const Node = require('./libp2p-bundle')
// const pull = require('pull-stream')
const series = require('async/series')

let listenerId
let listenerNode

series([
  (cb) => {
    PeerId.createFromJSON(require('./id-r'), (err, id) => {
      if (err) { return cb(err) }
      listenerId = id
      cb()
    })
  },
  (cb) => {
    const listenerPeerInfo = new PeerInfo(listenerId)
    listenerPeerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/10333')
    listenerPeerInfo.multiaddrs.add('/p2p-webrtc-star')
    listenerNode = new Node({
      peerInfo: listenerPeerInfo,
      config: {
        relay: {
          enabled: false
        }
      }
    })
    listenerNode.start(cb)
  }
], (err) => {
  if (err) { throw err }

  console.log('Listening on:')
  listenerNode.peerInfo.multiaddrs.forEach((ma) => {
    console.log(ma.toString() + '/p2p/' + listenerId.toB58String())
  })
})
