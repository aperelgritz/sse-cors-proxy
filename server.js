const express = require('express');
const http = require('http');
const request = require('request');

const app = express();

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
