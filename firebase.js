import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getDatabase, ref, set, onValue, onDisconnect, remove } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDQgmQRd5ZwhnrQC0lSWA5b8Dhyv7dADms",
    authDomain: "netloftonline.firebaseapp.com",
    databaseURL: "https://netloftonline-default-rtdb.firebaseio.com",
    projectId: "netloftonline",
    storageBucket: "netloftonline.firebasestorage.app",
    messagingSenderId: "397804084492",
    appId: "1:397804084492:web:0af8c0481ccd8dc21ebd29"
  };


const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export function registerPlayer(playerData) {
    const uid = crypto.randomUUID();
    const playerRef = ref(db, `players/${uid}`);

    set(playerRef, playerData);
    onDisconnect(playerRef).remove();

    return uid;
}

export function updatePlayer(uid, data) {
  const playerRef = ref(db, `players/${uid}`);
  set(playerRef, data);
}