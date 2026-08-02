// Vercel Serverless Function: Flow Webhook Handler
// Activates PLAN PRO in Firebase Cloud Firestore upon successful payment
const admin = require('firebase-admin');

if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            })
        });
    } catch (e) {
        console.error('Firebase Admin init error:', e.message);
    }
}

module.exports = async (req, res) => {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body || {};
        const query = req.query || {};
        const email = body.email || query.email || body.payer_email || query.payer_email;

        if (email && admin.apps.length) {
            const db = admin.firestore();
            const userRef = db.collection('users').doc(email);
            await userRef.set({
                plan: {
                    isPro: true,
                    planName: 'Plan PRO Mensual',
                    paymentStatus: 'paid',
                    subscribedAt: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                }
            }, { merge: true });

            console.log(`Flow Webhook: Activated PRO plan for ${email}`);
        }

        return res.status(200).json({ success: true, message: 'Flow webhook processed' });
    } catch (error) {
        console.error('Flow Webhook Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
