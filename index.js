const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');
const db = require('./db');
const router = require('./router/brandRouter');
db();
puppeteer.use(StealthPlugin());
require('dotenv').config();
const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use('/', router);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});