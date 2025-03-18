#!/bin/bash

# Build the application
ng build --configuration production

# Create a temporary directory
mkdir -p temp-deploy

# Copy the built files
cp -r dist/todo-app/* temp-deploy/

# Create a simple server file
cat > temp-deploy/server.js << 'EOL'
const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
EOL

# Create package.json for the server
cat > temp-deploy/package.json << 'EOL'
{
  "name": "todo-app-server",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOL

# Install dependencies
cd temp-deploy
npm install

# Start the server
node server.js 