const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

const mongoURI = "mongodb://localhost:27017/ecommerce";

// Connects to MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  DOB: Date,
});

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  imageUrl: String,
});

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);

// User authentication
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the provided password matches the stored password
    if (password !== user.password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Authentication successful
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    // Handle database errors
    console.error("Error authenticating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/register", async (req, res) => {
  const { username, email, password, DOB } = req.body;

  try {
    const user = new User({ username, email, password, DOB });
    await user.save();
    res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).send({ error: "Error registering user" });
  }
});

// fetch products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).send(products);
  } catch (error) {
    res.status(500).send({ error: "Error fetching products" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});