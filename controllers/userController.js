import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// register new admin
export const registerAdmin = async (req, res) => {
  const { email, phoneNumber, userName, password } = req.body;

  try {
    const existingUser = await userModel.findOne({
      $or: [{ email: email }, { userName: userName }],
    });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const newUser = new userModel({
      email,
      phoneNumber,
      userName,
      password,
      userType: "admin",
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password)

  try {
    const userData = await userModel.findOne({ email });
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // check password
    const isMatch = password === userData.password;
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // create a token
    const userName = userData.userName;
    const userID = userData._id;
    const token = jwt.sign(
      { id: userData._id, userName },
      process.env.SECRET_KEY
    );

    // sending username and token to frontend
    res.status(200).json({ userName, userID, token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// addClient by admin
export const addClient = async (req, res) => {
  try {
    const { email, phoneNumber, userName, password } = req.body;

    const existingUser = await userModel.findOne({
      $or: [{ email: email }, { userName: userName }],
    });
    
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const newUser = new userModel({
      email,
      phoneNumber,
      userName,
      password,
      addedBy: req.user._id,
      userType: "client",
    });
    await newUser.save();
    res.status(201).json({ message: "Client user registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



