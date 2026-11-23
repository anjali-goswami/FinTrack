
const mongoose = require("mongoose");
const dns = require("node:dns");
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from server/.env");
    }

    const dnsServers = (process.env.MONGO_DNS_SERVERS || "")
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean);
    if (dnsServers.length) dns.setServers(dnsServers);

    const connection = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

module.exports = connectDB;
