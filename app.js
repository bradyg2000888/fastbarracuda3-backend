
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const breakRoutes = require('./routes/breaks');

app.use(cors());
app.use(express.json());

app.use('/api/breaks', breakRoutes);

const PORT = process.env.PORT || 3000;
app.get('/test', (req, res) => {
  res.json({ message: 'Test route is working!' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
