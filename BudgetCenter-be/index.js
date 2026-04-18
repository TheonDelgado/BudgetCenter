const express = require("express");
const cors = require('cors');
const app = express();
const { createLinkController } = require("./link-handler/createLinkController");

const APP_PORT = process.env.APP_PORT || 8000;

app.use(cors());
app.use(express.json());

app.post('/create-link', createLinkController)

app.listen(APP_PORT, () => {
  console.log(`Server is listening on Port ${APP_PORT}`);
})