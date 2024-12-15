// routes/expenseRoutes.js
const express = require("express");
const { connect, getDatabase } = require("../db");
const { authenticateToken } = require("./middleware/auth");
const router = express.Router();
const moment = require("moment");

router.post("/expense", authenticateToken, async (req, res) => {
  try {
    console.log("post hit..");
    const { email, ...newItem } = req.body;
    const { date } = newItem;
    const parsedDate = new Date(date);
    console.log("🚀 ~ router.post ~ parsedDate:", parsedDate);
    console.log(typeof parsedDate);
    newItem.date = parsedDate;
    await connect();
    const db = getDatabase();
    const collName = process.env.MONGO_EXPENSEMANAGER_COLLECTION;
    if (!collName) {
      return res.status(500).json({
        message: "Collection name is not defined in environment variables.",
      });
    }
    const collection = db.collection(collName);

    const response = await collection.updateOne(
      { email: email },
      { $push: { expenseFilter: newItem } }
    );
    if (response.modifiedCount === 1) {
      return res.status(200).json({ message: "Success" });
    } else {
      return res.status(400).json({ message: "Could not add the Expense" });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Could not add the Expense" });
  }
});

router.get("/expense", authenticateToken, async (req, res) => {
  try {
    const { email, date } = req.query;
    console.log("🚀 ~ router.get ~ email, date:", email, date);
    const currentDate = moment(date);
    const nextDate = currentDate.add(1, "day").toISOString();

    console.log(nextDate); // Outputs: 2024-10-02T00:00:00.000Z

    if (!email || !date) {
      console.log("🚀 ~ router.get ~ Email and date are required:");
      return res.status(400).json({ message: "Email and date are required." });
    }

    const pipeline = [
      {
        $match: {
          email: email,
          expenseFilter: {
            $elemMatch: {
              date: {
                $gte: new Date(date),
                $lte: new Date(nextDate),
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          expenseFilter: {
            $filter: {
              input: "$expenseFilter",
              as: "expenses",
              cond: {
                $and: [
                  {
                    $gte: ["$$expenses.date", new Date(date)],
                  },
                  {
                    $lte: ["$$expenses.date", new Date(nextDate)],
                  },
                ],
              },
            },
          },
        },
      },
    ];
    await connect();
    const db = getDatabase();
    const collName = process.env.MONGO_EXPENSEMANAGER_COLLECTION;

    if (!collName) {
      return res.status(500).json({
        message: "Collection name is not defined in environment variables.",
      });
    }
    const collection = db.collection(collName);
    const response = await collection.aggregate(pipeline).toArray();

    if (!response) {
      return res.status(500).json({ message: "Response is undefined." });
    }
    return res.status(200).json({ data: response[0] || [] });
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(400).json({ message: err });
  }
});

router.get("/expense/graph", authenticateToken, async (req, res) => {
  try {
    const { email, sDate, eDate } = req.query;
    console.log("🚀 ~ router.get ~ sDate, eDate:", sDate, eDate);
    await connect();
    const db = getDatabase();
    const collName = process.env.MONGO_EXPENSEMANAGER_COLLECTION;

    if (!collName) {
      return res.status(500).json({
        message: "Collection name is not defined in environment variables.",
      });
    }
    const collection = db.collection(collName);
    const startDate = new Date(sDate);
    const endDate = new Date(eDate);
    const pipeline = [
      {
        $match: {
          email: email,
          expenseFilter: {
            $elemMatch: {
              date: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          },
        },
      },
      {
        $unwind: "$expenseFilter",
      },
      {
        $match: {
          "expenseFilter.date": {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$expenseFilter.date",
            },
          },
          totalAmount: {
            $sum: {
              $toDouble: "$expenseFilter.amount",
            },
          },
          expenses: { $push: "$expenseFilter" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalAmount: 1,
          expenses: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();

    console.log(result);

    return res.status(200).json({ data: result });
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(400).json({ message: err });
  }
});

router.get("/expense/pie-chart", authenticateToken, async (req, res) => {
  try {
    const { email, sDate, eDate } = req.query;
    console.log("🚀 ~ router.get ~ email, sDate, eDate:", email, sDate, eDate);
    await connect();
    const db = getDatabase();
    const collName = process.env.MONGO_EXPENSEMANAGER_COLLECTION;

    if (!collName) {
      return res.status(500).json({
        message: "Collection name is not defined in environment variables.",
      });
    }
    const collection = db.collection(collName);
    const startDate = new Date(sDate);
    const endDate = new Date(eDate);
    const pipeline = [
      {
        $match: {
          email: email,
          expenseFilter: {
            $elemMatch: {
              date: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          },
        },
      },
      {
        $unwind: "$expenseFilter",
      },
      {
        $match: {
          "expenseFilter.date": {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$expenseFilter.expenseType", // Group by expenseType
          totalAmount: {
            $sum: {
              $toDouble: "$expenseFilter.amount",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          expenseType: "$_id",
          totalAmount: 1,
          expenses: 1,
        },
      },
      {
        $sort: { expenseType: 1 },
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();

    console.log(result);

    return res.status(200).json({ data: result });
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(400).json({ message: err });
  }
});

router.get("/expense/totalSpends", authenticateToken, async (req, res) => {
  try {
    const { email, dateRanges } = req.query; // Expecting dateRanges as an array

    await connect();
    const db = getDatabase();
    const collName = process.env.MONGO_EXPENSEMANAGER_COLLECTION;

    if (!collName) {
      return res.status(500).json({
        message: "Collection name is not defined in environment variables.",
      });
    }

    const collection = db.collection(collName);

    const pipeline = [];

    let parsedDateRanges;

    try {
      parsedDateRanges = Array.isArray(dateRanges)
        ? dateRanges
        : JSON.parse(dateRanges);
    } catch (error) {
      console.log("🚀 ~ router.get ~ error:", error);
      return res.status(400).json({
        message:
          "Invalid dateRanges format. Please provide an array of date ranges.",
      });
    }

    const facets = {};

    parsedDateRanges.forEach((range, index) => {
      const startDate = new Date(range.startDate);
      const endDate = new Date(range.endDate);
      facets[`range_${index + 1}`] = [
        {
          $match: {
            email: email,
            expenseFilter: {
              $elemMatch: {
                date: {
                  $gte: startDate,
                  $lte: endDate,
                },
              },
            },
          },
        },
        {
          $unwind: "$expenseFilter",
        },
        {
          $match: {
            "expenseFilter.date": {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: {
                $toDouble: "$expenseFilter.amount",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalAmount: 1,
          },
        },
      ];
    });

    pipeline.push({ $facet: facets });

    const result = await collection.aggregate(pipeline).toArray();

    const totals = {};
    for (const key in result[0]) {
      const totalAmount =
        result[0][key].length > 0 ? result[0][key][0].totalAmount : 0;
      totals[key] = totalAmount;
    }

    return res.status(200).json({ totals });
  } catch (err) {
    console.error("Error fetching data:", err);
    return res.status(400).json({ message: err });
  }
});

module.exports = router;
