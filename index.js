const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Product = require("./models/product");
const methodOverride = require("method-override");
const { urlencoded } = require("express");
const AppError = require("./AppError");

mongoose
  .connect("mongodb://127.0.0.1:27017/farmStand2")
  .then(() => {
    console.log("Mogo connection open");
  })
  .catch((err) => {
    console.log("mongo connection error");
    console.log(err);
  });

app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(methodOverride('_method'));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/products", async (req, res) => {
  const { category } = req.query;
  const product = {};

  if (!category) {
    products = await Product.find({});
  } else {
    products = await Product.find({ category: category });
  }
  res.render("products/index", { products });
});

app.get("/products/new", (req, res) => {
  const categories = Product.schema.path("category").enumValues;
  res.render("products/addProduct", { categories });
});

app.get("/products/:productId", async (req, res, next) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }
  res.render("products/product", { product });
});

app.get("/products/:id/edit", async (req, res, next) => {
  const { id } = req.params;
  const categories = Product.schema.path("category").enumValues;
  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }
  res.render("products/editProduct", { product, categories });
});

app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, req.body, {
    runValidators: true,
  });
  res.redirect(`/products/${product._id}`);
});

app.post("/products", async (req, res, next) => {
  try {
    const newProduct = new Product(req.body);
    newProduct.save();
    res.redirect(`/products/${newProduct._id}`);
  } catch (err) {
    next(err);
  }
});

app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  console.log(id);
  await Product.deleteOne({ _id: id });
  res.redirect("/products");
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).send(message);
});

app.listen(3000, () => {
  console.log("App is listening on port 3000");
});
