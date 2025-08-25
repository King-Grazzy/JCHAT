// Public config placeholders. Copy this file to config.js and fill real values.
// The Firebase config is safe to expose; Cloudinary should use an unsigned preset.

window.firebaseConfig = window.firebaseConfig || {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

window.cloudinaryConfig = window.cloudinaryConfig || {
  cloudName: "YOUR_CLOUDINARY_CLOUD_NAME",
  unsignedUploadPreset: "YOUR_UNSIGNED_UPLOAD_PRESET"
};

// Optional: default peer for quick testing; override via URL params (?peerId=&peerName=&peerAvatar=)
window.defaultPeer = window.defaultPeer || {
  id: "",
  name: "",
  avatar: "assets/icon2.png"
};

