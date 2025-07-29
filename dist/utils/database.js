"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MONGODB_URI = 'mongodb+srv://jarvis:csV99U9dBi02Rjaf@yeldamdatahub.uguun7u.mongodb.net/shop_ssv?retryWrites=true&w=majority&appName=yeldamdatahub';
const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB with URI:', MONGODB_URI);
        const conn = await mongoose_1.default.connect(MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await mongoose_1.default.disconnect();
        console.log('MongoDB Disconnected');
    }
    catch (error) {
        console.error('Error disconnecting from MongoDB:', error);
    }
};
exports.disconnectDB = disconnectDB;
//# sourceMappingURL=database.js.map