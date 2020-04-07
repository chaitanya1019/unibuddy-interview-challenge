const express = require('express');
const cors = require('cors');
const utilHelper = require('./util/helper.js');

const app = express();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());

app.get('/summaries', (req, res) => {
  const searchTxt = req.query.search; //read query params
  const response = utilHelper.searchSummaries(searchTxt, 3); //call helper fn to get data
  res.json(response);
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
