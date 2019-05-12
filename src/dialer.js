'use strict'
/* eslint-disable no-console */

/*
 * Listener Node
 */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const Node = require('./bundle')
const pull = require('pull-stream')
const series = require('async/series')

let listenerId
let listenerNode

series([
  (cb) => {
    PeerId.createFromJSON(require('./id-d'), (err, id) => {
      if (err) { return cb(err) }
      listenerId = id
      cb()
    })
  },
  (cb) => {
    const listenerPeerInfo = new PeerInfo(listenerId)
    listenerPeerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
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
  },
  (cb) => {
    listenerNode.dial(`/ip4/0.0.0.0/tcp/10333/ipfs/${require('./id-r').id}`, cb)
  },
  (cb) => {
    setTimeout(cb, 5000)
  },
  (cb) => {
    // console.log("b")
    listenerNode.dialProtocol(`/p2p-webrtc-star/ipfs/${require('./id-l').id}`, '/echo/1.0.0', cb)
    // console.log(`/p2p-circuit/ipfs/${require('./id-l').id}`)
    // cb()
  }
], (err, conn) => {
  if (err) { throw err }

  console.log('Listening on:')
  listenerNode.peerInfo.multiaddrs.forEach((ma) => {
    console.log(ma.toString() + '/p2p/' + listenerId.toB58String())
  })

  console.log(`Sending data to /p2p-webrtc-star/ipfs/${require('./id-l').id}`)

  pull(
    pull.values(['hey']),
    conn.conn, // TODO: why conn.conn???
    pull.collect((err, data) => {
      if (err) { throw err }
      console.log('received echo:', data.toString())
    })
  )
})
