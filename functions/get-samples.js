const { initializeApp } = require('firebase/app');
const { initializeApp: adminInit, getFirestore, collection, getDocs } = require('firebase-admin');

const firebaseConfig = {
  apiKey: "AIzaSyBc0tQbTtScLONj7tNJHrCO4HvRwwzas2c",
  authDomain: "boogiebox.firebaseapp.com",
  projectId: "boogiebox",
  storageBucket: "boogiebox.firebasestorage.app",
  messagingSenderId: "263732124383",
  appId: "1:263732124383:web:436f07eee9cfbc65dde76a",
};

// Initialize Firebase client (though not strictly needed for Firestore Admin)
initializeApp(firebaseConfig);

// Initialize Firebase Admin for Firestore
if (!admin.apps.length) {
  adminInit({
    credential: admin.credential.applicationDefault(), // Use service account in production
  });
}
const db = getFirestore();

exports.handler = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'samples'));
    const sampleList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return {
      statusCode: 200,
      body: JSON.stringify(sampleList),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Error fetching samples:', error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch samples: ' + error.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};