const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const userRoutes = require('./routes/user');
const animeRoutes = require('./routes/anime');
const ratingRoutes = require('./routes/rating');

const app = express();
const port = process.env.PORT || 9000;

//middleware
app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', animeRoutes);
app.use('/api', ratingRoutes);

//routes
app.get('/', (req, res) => {
    res.send('Anikiwi API');
});

//routes
app.get('/api/state', (req, res) => {
    res.send('Anikiwi API state is OK');
});

//connect to mongodb
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected...'))
    .catch(error => console.log(error));

app.listen(port, () => { console.log('Server is listening on port', port) });
