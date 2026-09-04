import dotenv from "dotenv";
import express from "express";
import { nanoid } from "nanoid";
import urlSchema from "./src/models/shorturl.model.js"
import connectDB from "./src/config/mongo.config.js";

dotenv.config("./.env")

const app = express();

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/create", (req, res) => {
    const { url } = req.body;
    const shortUrl = nanoid(7)
    const newUrl = new urlSchema({
        full_url: url,
        short_url: shortUrl
    })
    newUrl.save()
    console.log(url);
    res.send(nanoid(7));
});

app.listen(3000, () => {
    connectDB();
    console.log(`Server is running on port 3000`);
});