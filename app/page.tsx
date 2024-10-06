"use client";

import { useState, useRef, useEffect } from 'react';
import Peer from 'simple-peer';

export default function Home() {
  const [localSdp, setLocalSdp] = useState<string>('');
  const [remoteSdp, setRemoteSdp] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const peerRef = useRef<Peer.Instance | null>(null);

  const createPeer = (initiator: boolean) => {
    peerRef.current = new Peer({ initiator });

    peerRef.current.on('signal', (data) => {
      setLocalSdp(JSON.stringify(data));
    });

    peerRef.current.on('connect', () => {
      setConnectionStatus('Connected to peer');
    });

    peerRef.current.on('data', (data) => {
      setMessages((prevMessages) => [...prevMessages, `Peer: ${data}`]);
    });

    peerRef.current.on('close', () => {
      setConnectionStatus('Disconnected from peer');
    });
  };

  const initiatePeer = () => {
    createPeer(true);
  };

  const joinPeer = () => {
    createPeer(false);
  };

  const connectPeers = () => {
    if (peerRef.current && remoteSdp) {
      peerRef.current.signal(JSON.parse(remoteSdp));
    }
  };

  const sendMessage = () => {
    if (peerRef.current && peerRef.current.connected && inputMessage) {
      peerRef.current.send(inputMessage);
      setMessages((prevMessages) => [...prevMessages, `You: ${inputMessage}`]);
      setInputMessage('');
    }
  };

  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold mb-4">WebRTC Text Chat (Manual SDP)</h2>
                <p>Status: {connectionStatus}</p>
                <div className="space-x-2">
                  <button onClick={initiatePeer} className="px-4 py-2 bg-blue-500 text-white rounded-md">Create Offer</button>
                  <button onClick={joinPeer} className="px-4 py-2 bg-green-500 text-white rounded-md">Join (Create Answer)</button>
                </div>
                <div>
                  <h3 className="font-bold">Local SDP:</h3>
                  <textarea
                    className="w-full h-32 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                    readOnly
                    value={localSdp}
                  ></textarea>
                </div>
                <div>
                  <h3 className="font-bold">Remote SDP:</h3>
                  <textarea
                    className="w-full h-32 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                    value={remoteSdp}
                    onChange={(e) => setRemoteSdp(e.target.value)}
                    placeholder="Paste the SDP from the other peer here"
                  ></textarea>
                </div>
                <button onClick={connectPeers} className="px-4 py-2 bg-purple-500 text-white rounded-md">Connect Peers</button>
                <div className="h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md"
                    placeholder="Type a message..."
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-500 text-white rounded-r-md"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}