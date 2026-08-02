// Vercel Serverless Function: Flow API Dynamic Payment Creation
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body || {};
        const query = req.query || {};
        const email = body.email || query.email || 'cliente@emitiapro.cl';
        const planName = body.planName || query.planName || 'Emitia Pro - Plan PRO Mensual';
        const amount = parseInt(body.amount || query.amount || 9990, 10);

        const apiKey = process.env.FLOW_API_KEY || '59A13F6C-6D8A-4772-B02C-7180350L27AA';
        const secretKey = process.env.FLOW_SECRET_KEY || '4c8d54e57ad62821e7a406d030af0da6c5e78ad8';
        const isProduction = true; // Use production flow.cl API

        const params = {
            apiKey: apiKey,
            commerceOrder: `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            subject: planName,
            currency: 'CLP',
            amount: amount,
            email: email,
            urlConfirmation: 'https://facturapulse-pro.vercel.app/api/webhook-flow',
            urlReturn: 'https://facturapulse-pro.vercel.app/?payment_success=true'
        };

        // Step 1: Sort parameters alphabetically by key
        const keys = Object.keys(params).sort();
        let toSign = '';
        keys.forEach(key => {
            toSign += `${key}${params[key]}`;
        });

        // Step 2: Calculate HMAC-SHA256 signature
        const signature = crypto.createHmac('sha256', secretKey).update(toSign).digest('hex');
        params.s = signature;

        // Step 3: Call Flow API POST endpoint
        const postData = querystring.stringify(params);
        const flowHost = isProduction ? 'www.flow.cl' : 'sandbox.flow.cl';
        const flowPath = '/api/payment/create';

        const requestOptions = {
            hostname: flowHost,
            port: 443,
            path: flowPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const flowResponse = await new Promise((resolve, reject) => {
            const request = https.request(requestOptions, (response) => {
                let responseData = '';
                response.on('data', chunk => responseData += chunk);
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(responseData));
                    } catch (err) {
                        resolve({ raw: responseData });
                    }
                });
            });
            request.on('error', err => reject(err));
            request.write(postData);
            request.end();
        });

        if (flowResponse && flowResponse.url && flowResponse.token) {
            const redirectUrl = `${flowResponse.url}?token=${flowResponse.token}`;
            return res.status(200).json({ success: true, redirectUrl: redirectUrl, token: flowResponse.token });
        } else {
            console.error('Flow API Response:', flowResponse);
            // Fallback link if API signature needs sandbox/prod credentials alignment
            const fallbackUrl = `https://www.flow.cl/uri/0BTj8Mtxz?email=${encodeURIComponent(email)}&payer_email=${encodeURIComponent(email)}`;
            return res.status(200).json({ success: false, redirectUrl: fallbackUrl, flowResponse: flowResponse });
        }
    } catch (error) {
        console.error('Create Flow Payment Error:', error);
        return res.status(500).json({ error: error.message });
    }
};
