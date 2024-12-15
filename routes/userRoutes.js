// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { connect, getDatabase } = require("../db");

router.post("/users", async (req, res) => {});

router.get("/users", async (req, res) => {
  try {
    await connect();
    const db = getDatabase();
    const collName = process.env.MONGO_EXPENSEMANAGER_COLLECTION;
    const collection = db.collection(collName);
    const data = await collection.find({}).toArray();
    console.log("Fetched data:", data);
    return res.status(200).json({ data: data });
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(400).json({ message: err });
  }
});

module.exports = router;
