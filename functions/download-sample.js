const { initializeApp } = require('firebase/app');
const { initializeApp: adminInit, getFirestore, doc, getDoc } = require('firebase-admin');

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

exports.handler = async (event, context) => {
  try {
    // Extract sample ID from the path (e.g., /api/download-sample/{id})
    const sampleId = event.path.split('/').pop();
    if (!sampleId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Sample ID is required' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Fetch the sample from Firestore
    const sampleRef = doc(db, 'samples', sampleId);
    const sampleDoc = await getDoc(sampleRef);

    if (!sampleDoc.exists()) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Sample not found' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    const sampleData = sampleDoc.data();

    // Increment download count
    await sampleRef.update({
      downloadCount: (sampleData.downloadCount || 0) + 1,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ fileUrl: sampleData.fileUrl }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Error downloading sample:', error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to download sample: ' + error.message }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};