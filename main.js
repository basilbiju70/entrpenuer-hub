const APP_ID = "36017ef5b1fe409fa3bd2f9d0cc0ee8e";
const TOKEN = 1824a1c8b6354b388ace6655325e2f2c; // Use `null` for testing if you disabled app certificate
const CHANNEL = "validate-idea"; // static room name
const UID = Math.floor(Math.random() * 10000);

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTrack, localVideoTrack;

async function joinRoom() {
  await client.join(APP_ID, CHANNEL, TOKEN, UID);

  localTrack = await AgoraRTC.createMicrophoneAudioTrack();
  localVideoTrack = await AgoraRTC.createCameraVideoTrack();

  const localPlayer = document.getElementById("local-player");
  localVideoTrack.play(localPlayer);

  await client.publish([localTrack, localVideoTrack]);

  console.log("Published!");

  client.on("user-published", async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    console.log("Subscribed to remote user:", user.uid);

    if (mediaType === "video") {
      const remotePlayer = document.createElement("div");
      remotePlayer.id = `player-${user.uid}`;
      remotePlayer.style = "width: 400px; height: 300px; border: 1px solid red; margin: 10px;";
      document.getElementById("remote-playerlist").appendChild(remotePlayer);
      user.videoTrack.play(remotePlayer);
    }

    if (mediaType === "audio") {
      user.audioTrack.play();
    }
  });

  client.on("user-unpublished", user => {
    const remotePlayer = document.getElementById(`player-${user.uid}`);
    if (remotePlayer) remotePlayer.remove();
  });
}

async function leaveRoom() {
  localTrack.close();
  localVideoTrack.close();
  await client.leave();
  document.getElementById("local-player").innerHTML = "";
  document.getElementById("remote-playerlist").innerHTML = "";
  console.log("Left room.");
}
