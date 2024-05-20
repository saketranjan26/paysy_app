const express = require("express");
const router = express.Router();
const zod = require("zod");
const { User, Account } = require("../db");
const { JWT_SECRET } = require("../config");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware");

const signupSchema = zod.object({
  username: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string(),
});

router.post("/signup", async (req, res) => {
  const { success } = signupSchema.safeParse(req.body);

  if (!success) {
    return res.status(411).json({
      msg: "Incorrect inputs",
    });
  }

  const existingUser = await User.findOne({
    username: req.body.username,
  });
  // asynchronous because it involves interaction with database
  if (existingUser) {
    return res.status(411).json({
      msg: "Email already taken / Incorrect inputs",
    });
  }

  const user = await User.create({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password,
  });

  const userId = user._id;

  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });

  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET
  );

  // WE ARE CREATING A SIGN OR TOKEN WHICH WILL BE USED FOR VERIFICATION BY ITS userId WITH OUR JWT_SECRET
  // OR IN LAYMAN, WE ARE SIGNING IN THE USER IN OUR DATABASE BY GIVING HIM/HER A TOKEN WHICH HAVE
  // HIS + OUR SECRET CODE(WHICH HE CANT KNOW) ENCODED. AND THIS TOKEN WILL BE USED FOR VERIFICATION

  res.json({
    msg: "User created successfully",
    token: token,
  });
});

const signinSchema = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

router.post("/signin", async (req, res) => {
  const { success } = signinSchema.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      msg: "Incorrect Inputs",
    });
  }

  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });

  if (user) {
    usedId = user._id;
    const token = jwt.sign(
      {
        usedId,
      },
      JWT_SECRET
    );
    res.json({
      token: token,
    });
    return;
  }

  res.status(411).json({
    msg: "Error while logging in",
  });
});

const updateBody = zod.object({
  firstName: zod.string().optional(),
  lastName: zod.string().optional(),
  password: zod.string().optional(),
});

router.put("/", authMiddleware, async (req, res) => {
  const { success } = updateBody.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      message: "error while updating information",
    });
  }

  await User.updateOne({ _id: req.usedId }, req.body);

  res.json({
    message: "Updated successfully",
  });
});

router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";

  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
        },
      },
      {
        lastName: {
          $regex: filter,
        },
      },
    ],
  });

  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    }))
  });
});

module.exports = router;
