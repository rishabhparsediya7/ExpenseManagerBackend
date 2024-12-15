// routes/expenseRoutes.js
const express = require("express");
const { authenticateToken } = require("./middleware/auth");
const axios = require("axios");
const router = express.Router();

router.get("/activitycentre/money-saving", async (req, res) => {
  const newsApiKey = process.env.NEWS_API_KEY;
  const response = await axios.get(
    `https://newsapi.org/v2/everything?q=money%20saving&sortBy=publishedAt&apiKey=${newsApiKey}`
  );

  if (response.status === 200) {
    const articles = response.data.articles.map((article) => ({
      source: article.source.name,
      id: article.url,
      title: article.title,
      description: article.description,
      url: article.url,
      image: article.urlToImage,
      publishedAt: article.publishedAt,
      type: "blog",
    }));

    return res.status(200).json({
      data: articles,
    });
  }
  return res.status(400).json({
    message: "Could not fetch the data",
  });
});

router.get(
  "/activitycentre/youtube",
  authenticateToken,
  async (req, res) => {}
);

module.exports = router;
