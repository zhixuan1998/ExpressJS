const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getStorage, ref, uploadBytes, deleteObject } = require("firebase-admin/storage");
const config = require("../appsettings");

const app = initializeApp(config.firebaseconfig);

const auth = getAuth(app);
const storage = getStorage(app);

async function verifyIdToken(accessToken) {
  return await auth.verifyIdToken(accessToken);
}

async function uploadFile(base64, path) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, base64);
}

async function deleteFile(path) {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

module.exports = { verifyIdToken, uploadFile, deleteFile };
