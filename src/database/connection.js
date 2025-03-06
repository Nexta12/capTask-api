
import mongoose from "mongoose";
mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
     await mongoose.connect(process.env.MONGO_URI);
    logger.info(`Server connected to Database`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

export default connectDB;
