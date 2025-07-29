"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const products_1 = __importDefault(require("./routes/products"));
const orders_1 = __importDefault(require("./routes/orders"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const chef_1 = __importDefault(require("./routes/chef"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const database_1 = require("./utils/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true
}));
app.use(limiter);
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Fast Food Shop Management API is running',
        timestamp: new Date().toISOString()
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/products', products_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/inventory', inventory_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/chef', chef_1.default);
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room: ${room}`);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
app.set('io', io);
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await (0, database_1.connectDB)();
        console.log('✅ Connected to MongoDB');
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
            console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});
//# sourceMappingURL=index.js.map