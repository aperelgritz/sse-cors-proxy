const express = require('express');
const http = require('http');
const request = require('request');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(
	cors({
		origin: [
			process.env.ALLOWED_ORIGIN_1 ? process.env.ALLOWED_ORIGIN_1 : '',
			process.env.ALLOWED_ORIGIN_2 ? process.env.ALLOWED_ORIGIN_2 : '',
		],
		methods: ['GET', 'OPTIONS'], // Allow GET and preflight OPTIONS requests
		allowedHeaders: ['Authorization', 'Content-Type', 'X-Org-Id'], // Allow custom headers
	})
);

// Handle preflight OPTIONS requests
app.options('/sse', cors());

app.get('/sse', (req, res) => {
	const sseUrl = process.env.SSE_URL;
	const ts = Date.now();

	const options = {
		url: `${sseUrl}?_ts=${ts}`,
		headers: {
			Authorization: req.headers.authorization,
			Accept: 'text/event-stream',
			'X-Org-Id': process.env.ORG_ID,
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
