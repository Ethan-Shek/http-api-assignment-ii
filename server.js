const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// In-memory storage
const users = {};

// Helpers
const respondJSON = (res, status, obj) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
};

const serveFile = (res, filePath, contentType, status = 200) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      respondJSON(res, 500, { message: 'Internal Server Error', id: 'internal' });
      return;
    }
    res.writeHead(status, { 'Content-Type': contentType });
    res.end(data);
  });
};

// Routes
const handleGetUsers = (res, method) => {
  if (method === 'HEAD') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end();
  } else {
    respondJSON(res, 200, { users });
  }
};

const handleNotReal = (res, method) => {
  if (method === 'HEAD') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end();
  } else {
    respondJSON(res, 404, { message: 'The page you are looking for was not found.', id: 'notFound' });
  }
};

const handleAddUser = (req, res) => {
  let body = '';
  req.on('data', (chunk) => { body += chunk; });

  req.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      const { name, age } = parsed;

      if (!name || !age) {
        respondJSON(res, 400, { message: 'Name and age are required.', id: 'missingParams' });
        return;
      }

      if (users[name]) {
        users[name].age = age;
        res.writeHead(204, { 'Content-Type': 'application/json' });
        res.end();
      } else {
        users[name] = { name, age };
        respondJSON(res, 201, { message: 'User created successfully.' });
      }
    } catch (err) {
      respondJSON(res, 400, { message: 'Invalid JSON body.', id: 'badRequest' });
    }
  });
};

// Main request handler
const handleRequest = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;

  if (pathname === '/' || pathname === '/client.html') {
    serveFile(res, path.join(__dirname, 'client', 'client.html'), 'text/html');
    return;
  }
  if (pathname === '/style.css') {
    serveFile(res, path.join(__dirname, 'client', 'style.css'), 'text/css');
    return;
  }
  if (pathname === '/client.js') {
    serveFile(res, path.join(__dirname, 'client', 'client.js'), 'application/javascript');
    return;
  }

  if (pathname === '/getUsers' && (req.method === 'GET' || req.method === 'HEAD')) {
    handleGetUsers(res, req.method);
    return;
  }
  if (pathname === '/notReal' && (req.method === 'GET' || req.method === 'HEAD')) {
    handleNotReal(res, req.method);
    return;
  }
  if (pathname === '/addUser' && req.method === 'POST') {
    handleAddUser(req, res);
    return;
  }

  // Default 404
  if (req.method === 'HEAD') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end();
  } else {
    respondJSON(res, 404, { message: 'The page you are looking for was not found.', id: 'notFound' });
  }
};

// Start server
const PORT = process.env.PORT || 3000;
http.createServer(handleRequest).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
