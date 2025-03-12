// server.js

// Import necessary modules
const express = require('express'); // Express web server framework
const bodyParser = require('body-parser'); // Middleware to handle request bodies
const fs = require('fs'); // File system module to read and write files

const app = express(); // Create an Express application
const port = 3000; // Choose a port for your server to listen on

const usersFilePath = './users.json'; // Path to the JSON file to store user data

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// --- Helper Functions ---
/**
 * Reads user data from the users.json file.
 * Creates the file if it doesn't exist and initializes with an empty array.
 * @returns {Array<object>} Array of user objects from users.json, or empty array if file is empty or not found.
 */
function readUsersData() {
    try {
        const rawData = fs.readFileSync(usersFilePath); // Try to read data from the file
        if (!rawData) { // If the file is empty, return an empty array
            return [];
        }
        return JSON.parse(rawData); // Parse the JSON data and return it
    } catch (error) {
        if (error.code === 'ENOENT') { // File not found error
            // If the file doesn't exist, create it and initialize with empty array
            fs.writeFileSync(usersFilePath, '[]');
            return [];
        }
        console.error("Error reading user data:", error); // Log other errors
        return []; // Return empty array in case of error
    }
}

/**
 * Writes user data to the users.json file.
 * @param {Array<object>} usersData Array of user objects to write to the file.
 */
function writeUsersData(usersData) {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2)); // Write user data to file, formatted JSON
    } catch (error) {
        console.error("Error writing user data:", error); // Log errors during file writing
    }
}


// --- Signup Endpoint ---
app.post('/signup', (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) { // Check if email and password are provided
        return res.status(400).json({ message: 'Email and password are required.' }); // Respond with 400 error if missing
    }

    let users = readUsersData(); // Read existing user data

    // Check if user with this email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(409).json({ message: 'Email already registered.' }); // Respond with 409 conflict if email exists
    }

    // Create new user object
    const newUser = {
        email: email,
        password: password, // In a real application, you would hash the password!
        timestamp: new Date().toISOString() // Add signup timestamp
    };

    users.push(newUser); // Add the new user to the users array
    writeUsersData(users); // Write the updated users array back to users.json

    console.log(`User signed up: ${email}`); // Log signup action on the server
    res.status(201).json({ message: 'Signup successful!' }); // Respond with 201 success
});


// --- Login Endpoint ---
app.post('/login', (req, res) => {
    const { email, password } = req.body; // Extract email and password from request body

    if (!email || !password) { // Check if email and password are provided
        return res.status(400).json({ message: 'Email and password are required.' }); // Respond with 400 error if missing
    }

    const users = readUsersData(); // Read user data

    // Find user by email
    const user = users.find(user => user.email === email);

    if (!user) { // If user not found
        return res.status(401).json({ message: 'Invalid credentials. User not found.' }); // Respond with 401 unauthorized
    }

    // Check password (In real app, compare hashed passwords!)
    if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials. Password incorrect.' }); // Respond with 401 unauthorized
    }

    console.log(`User logged in: ${email}`); // Log login action on server
    res.status(200).json({ message: 'Login successful!' }); // Respond with 200 success
});


// --- Start the server ---
app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`); // Log server start message
});
