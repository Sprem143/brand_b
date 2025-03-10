const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');
const db = require('./db');
const router = require('./router/brandRouter');
const invRouter = require('./router/inventory2Router');
const analysisRouter = require('./router/analysisRouter')
const calculationRouter= require('./router/calculationRouter')
db();
puppeteer.use(StealthPlugin());
require('dotenv').config();
const app = express();
const port = process.env.PORT;


const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use('/', router);
app.use('/inv', invRouter);
app.use('/analysis', analysisRouter);
app.use('/calculation', calculationRouter);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
