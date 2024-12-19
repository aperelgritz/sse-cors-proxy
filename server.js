const express = require('express');
const http = require('http');
const request = require('request');
const cors = require('cors');

const app = express();

// Allow CORS for your storefront's origin
// const allowedOrigins = ['https://zzse-022.dx.commercecloud.salesforce.com'];
// app.use(
// 	cors({
// 		origin: (origin, callback) => {
// 			if (allowedOrigins.includes(origin) || !origin) {
// 				callback(null, true);
// 			} else {
// 				callback(new Error('Not allowed by CORS'));
// 			}
// 		},
// 		methods: ['GET', 'POST'], // Allow only necessary methods
// 		allowedHeaders: ['Authorization', 'Content-Type'], // Allow necessary headers
// 	})
// );
// CORS middleware configuration
app.use(
	cors({
		origin: ['https://zzse-022.dx.commercecloud.salesforce.com', 'https://aperelgritz.github.io'],
		methods: ['GET', 'OPTIONS'], // Allow GET and preflight OPTIONS requests
		allowedHeaders: ['Authorization', 'Content-Type', 'X-Org-Id'], // Allow custom headers
	})
);

// Handle preflight OPTIONS requests
app.options('/sse', cors());

app.get('/sse', (req, res) => {
	const sseUrl = 'https://rcg-ido-spring24.my.salesforce-scrt.com/eventrouter/v1/sse';
	const ts = Date.now();

	const options = {
		url: `${sseUrl}?_ts=${ts}`,
		headers: {
			Authorization: req.headers.authorization,
			Accept: 'text/event-stream',
			'X-Org-Id': '00D0900000DYKY0',
		},
	};

	const clientReq = request(options);

	// Periodic keep-alive comments to avoid Heroku timeout
	const keepAliveInterval = setInterval(() => {
		try {
			res.write(': keep-alive\n\n'); // Send a comment as a keep-alive signal
		} catch (error) {
			console.error('Error sending keep-alive signal:', error);
			clearInterval(keepAliveInterval); // Stop interval on failure
		}
	}, 25000); // Send every 25 seconds (Heroku's timeout is 30 seconds)

	clientReq.on('data', (chunk) => {
		try {
			res.write(chunk); // Relay data to the frontend
		} catch (writeError) {
			console.error('Error writing chunk to response:', writeError);
		}
	});

	clientReq.on('error', (err) => {
		if (err.code === 'ECONNRESET') {
			console.log('SSE connection aborted gracefully.');
		} else {
			console.error('SSE proxy error:', err);
			if (!res.headersSent) {
				res.status(500).send('Error connecting to SSE endpoint');
			}
		}
	});

	res.set({
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		Connection: 'keep-alive',
	});

	req.on('close', () => {
		console.log('Client connection closed. Aborting SSE request.');
		clientReq.abort();
	});
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
