const express = require('express');
const utilHelper = require('./util/helper.js');

const app = express();

// Init Middleware
app.use(express.json({ extended: false }));

app.get('/summaries', (req, res) => {
  const searchTxt = req.query.search;
  const response = utilHelper.searchSummaries(searchTxt, 3);
  res.json(response);
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
