const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("🚀 ~ jwt.verify ~ err:", err);
      return res.status(403).json({ message: "Token is not valid" });
    }
    req.user = user;
    next();
  });
};

const generateToken = async (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    expiresIn: "2d",
  };
  const token = await jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "2d",
  });

  return token;
};

module.exports = {
  generateToken,
  authenticateToken,
};
