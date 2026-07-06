/**
 * WebRTC Signaling Server (Milestone 4: Video Calling Integration - Basic)
 *
 * This does NOT relay actual audio/video - that happens peer-to-peer between
 * browsers via WebRTC. This server's only job is to help two peers find each
 * other and exchange the connection info (SDP offers/answers + ICE candidates)
 * needed to establish that direct peer-to-peer connection.
 *
 * Flow:
 *  1. Both users "join-room" using the meeting's roomId
 *  2. First user creates a WebRTC offer, sends it via "send-offer"
 *  3. Second user receives it via "receive-offer", creates an answer, sends "send-answer"
 *  4. First user receives it via "receive-answer"
 *  5. Both sides exchange ICE candidates via "send-ice-candidate" / "receive-ice-candidate"
 *  6. Either side can "toggle-audio" / "toggle-video" (just for UI sync) or "end-call"
 */

const registerVideoSignaling = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a call room (roomId comes from the accepted Meeting document)
    socket.on("join-room", ({ roomId, userId }) => {
      socket.join(roomId);
      socket.data.userId = userId;
      socket.data.roomId = roomId;

      // Notify the other person in the room that someone joined
      socket.to(roomId).emit("user-joined", { userId, socketId: socket.id });
      console.log(`User ${userId} joined room ${roomId}`);
    });

    // Relay SDP offer to the other peer in the room
    socket.on("send-offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("receive-offer", { offer, from: socket.id });
    });

    // Relay SDP answer back to the offerer
    socket.on("send-answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("receive-answer", { answer, from: socket.id });
    });

    // Relay ICE candidates both ways
    socket.on("send-ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("receive-ice-candidate", { candidate, from: socket.id });
    });

    // UI sync events - let the other peer know mic/camera state changed
    socket.on("toggle-audio", ({ roomId, userId, audioEnabled }) => {
      socket.to(roomId).emit("peer-toggle-audio", { userId, audioEnabled });
    });

    socket.on("toggle-video", ({ roomId, userId, videoEnabled }) => {
      socket.to(roomId).emit("peer-toggle-video", { userId, videoEnabled });
    });

    // End the call for everyone in the room
    socket.on("end-call", ({ roomId }) => {
      io.to(roomId).emit("call-ended");
    });

    socket.on("disconnect", () => {
      const { roomId, userId } = socket.data || {};
      if (roomId) {
        socket.to(roomId).emit("user-left", { userId, socketId: socket.id });
      }
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = registerVideoSignaling;
