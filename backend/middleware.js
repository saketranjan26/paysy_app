const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer"))
    return res.status(403).json({});

  const token = authHeader.split(" ")[1]; // split and assign the next sliced part( because [1]) to token

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.userId) {
      req.userId = decoded.userId;
      next();
    } else {
      return res.status(403).json({msg:"problem occured"});
    }
  } catch (err) {
    return res.status(403).json({msg:"problem occured"});
  }
};

module.exports = {
  authMiddleware,
};
