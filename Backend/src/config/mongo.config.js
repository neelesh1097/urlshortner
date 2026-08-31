import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,

        });
        console.log(`MongoDB connected : ${connect.connection.host}`);
    } catch (error) {
        console.log(error);
    }
}