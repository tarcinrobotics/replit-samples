const express = require('express');
const app = express();
const PORT = 5000;

// Middleware
app.use(express.static('public')); // Serve static files from 'public' directory

// Sample route
app.get('/', (req, res) => {
    res.send('<h1>Hello, Replit!</h1>'); // Change this to your desired content
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${5000}`);
    
});
