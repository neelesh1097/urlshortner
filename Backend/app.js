import dotenv from "dotenv";
import express from "express";
import urlSchema from "./src/models/shorturl.model.js";
import connectDB from "./src/config/mongo.config.js";
import shorturlRouter from "./src/routes/shorturl.routes.js";

dotenv.config("./.env");

const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount short URL routes
app.use("/api/create", shorturlRouter);

app.get("/:id", async (req, res) => {
    const { id } = req.params;
    const url = await urlSchema.findOne({ short_url: id });
    if (url) {
        res.redirect(url.full_url);
    } else {
        res.status(404).send("Url not found");
    }
});

app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});