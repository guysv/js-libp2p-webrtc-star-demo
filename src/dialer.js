'use strict'
/* eslint-disable no-console */

/*
 * Listener Node
 */

const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const Node = require('./bundle')
const pull = require('pull-stream')
const waterfall = require('async/waterfall')

let listenerId
let listenerNode
let conn

waterfall([
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
  },
  (newConn, cb) => {
    conn = newConn
    console.log(`Hanging up /ip4/0.0.0.0/tcp/10333/ipfs/${require('./id-r').id}`)
    listenerNode.hangUp(`/ip4/0.0.0.0/tcp/10333/ipfs/${require('./id-r').id}`, cb)
  },
  (cb) => {
    console.log('Current connections:')
    Object.values(listenerNode.peerBook.getAll()).forEach((peer) => {
      const addr = peer.isConnected()
      if (addr) {
        console.log(addr.toString())
      }
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
  }
], (err) => {
  if (err) { throw err }
})
