const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');
const db = require('./db');
const router = require('./router/brandRouter');
const invRouter = require('./router/inventory2Router')
db();
puppeteer.use(StealthPlugin());
require('dotenv').config();
const app = express();
const port = process.env.PORT || 10000;


const corsOptions = {
    origin: 'https://belk-brand-prem.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use('/', router);
app.use('/inv', invRouter);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});