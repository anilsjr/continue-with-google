const express = require('express');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

app.set('view engine', 'ejs');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add this middleware

app.use('/', authRoutes);

app.get('/', (req, res) => {
  res.render('index');
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});