const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { initializeApp: adminInit, getFirestore, collection, addDoc } = require('firebase-admin');

const firebaseConfig = {
  apiKey: "AIzaSyBc0tQbTtScLONj7tNJHrCO4HvRwwzas2c",
  authDomain: "boogiebox.firebaseapp.com",
  projectId: "boogiebox",
  storageBucket: "boogiebox.firebasestorage.app",
  messagingSenderId: "263732124383",
  appId: "1:263732124383:web:436f07eee9cfbc65dde76a",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Initialize Firebase Admin for Firestore
if (!admin.apps.length) {
  adminInit({
    credential: admin.credential.applicationDefault(), // Use service account in production
  });
}
const db = getFirestore();

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { name, type, duration, tags, description, file } = JSON.parse(event.body);
    if (!name || !file) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields (name or file)' }) };
    }

    const fileBuffer = Buffer.from(file, 'base64');

    // Upload to Firebase Storage
    const storageRef = ref(storage, `samples/${name}-${Date.now()}`);
    await uploadBytes(storageRef, fileBuffer);
    const fileUrl = await getDownloadURL(storageRef);

    // Save metadata to Firestore
    const sample = {
      name,
      type,
      duration,
      date: new Date().toISOString().split('T')[0],
      fileUrl,
      tags: JSON.parse(tags),
      description,
      downloadCount: 0,
    };

    const docRef = await addDoc(collection(db, 'samples'), sample);

    return {
      statusCode: 201,
      body: JSON.stringify({ ...sample, id: docRef.id }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Upload error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to upload sample: ${error.message}` }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};