import mongoose from "mongoose";

const clickLogSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
    },
    userAgent: {
        type: String,
        default: "Unknown",
    },
    referrer: {
        type: String,
        default: "Direct",
    }
}, { _id: false });

const shortUrlSchema = new mongoose.Schema(
    {
        full_url: {
            type: String,
            required: true,
            trim: true,
        },
        short_url: {
            type: String,
            required: true,
            index: true,
            unique: true,
            trim: true,
        },
        title: {
            type: String,
            default: "",
            trim: true,
        },
        clicks: {
            type: Number,
            required: true,
            default: 0,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
        clickLogs: [clickLogSchema],
    },
    {
        timestamps: true,
    }
);

const ShortUrl = mongoose.model("shortUrl", shortUrlSchema);

export default ShortUrl;