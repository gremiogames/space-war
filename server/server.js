const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  transports: ["websocket"],
  cors: {
    origin: [/localhost/, /github\.dev/, /feira-de-jogos\.dev\.br/],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
});

const roomMatchState = new Map();

function getOrCreateRoomMatchState(room) {
  if (!roomMatchState.has(room)) {
    roomMatchState.set(room, {
      matchStartAt: null,
      latestScene0State: null,
    });
  }

  return roomMatchState.get(room);
}

function resetRoomMatchState(room) {
  roomMatchState.set(room, {
    matchStartAt: null,
    latestScene0State: null,
  });
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);

    const roomState = getOrCreateRoomMatchState(room);
    if (
      roomState &&
      typeof roomState.matchStartAt === "number" &&
      roomState.matchStartAt > Date.now()
    ) {
      socket.emit("scene0-match-start", {
        matchStartAt: roomState.matchStartAt,
        serverTime: Date.now(),
      });
    }
  });

  socket.on("reset-room-match", (room) => {
    if (!room) return;

    resetRoomMatchState(room);
  });

  socket.on("select-player", (room, player) => {
    console.log(`Selected player ${player} in room ${room}`);
    socket.to(room).emit("player-selected", player);
  });

  socket.on("start-game", (room, player) => {
    console.log(`Game started in room ${room} by player ${player}`);
    socket.to(room).emit("start-game", player);
  });

  socket.on("change-scene", (room, scene) => {
    console.log(`Changing scene to ${scene} in room ${room}`);
    socket.to(room).emit("change-scene", scene);
  });

  socket.on("scene0", (room, state) => {
    // Use volatile updates for realtime state to avoid queue buildup/lag.
    // Broadcast to the whole room (including sender) so every client can
    // continuously correct local clock drift from serverTime.
    const roomState = getOrCreateRoomMatchState(room);
    roomState.latestScene0State = {
      ...state,
      serverTime: Date.now(),
    };

    io.to(room).volatile.emit("scene0", {
      ...state,
      serverTime: Date.now(),
    });
  });

  socket.on("scene0-ready", (room) => {
    if (!room) return;

    // Ensure the socket is actually in the room before broadcasting start.
    socket.join(room);

    const roomState = getOrCreateRoomMatchState(room);
    const now = Date.now();

    // Recreate match start when absent or stale from a previous session.
    if (!roomState.matchStartAt || roomState.matchStartAt < now - 30000) {
      roomState.matchStartAt = now + 1200;
    }

    io.to(room).emit("scene0-match-start", {
      matchStartAt: roomState.matchStartAt,
      serverTime: now,
    });

    // Send the last known snapshot to the whole room reliably so late-joiners
    // or clients that missed volatile updates receive a consistent initial state.
    if (roomState.latestScene0State) {
      const snapshot = {
        ...roomState.latestScene0State,
        serverTime: now,
      };

      io.to(room).emit("scene0", snapshot);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(3000);
