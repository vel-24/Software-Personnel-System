import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import complianceRoutes from './routes/complianceRoutes.js';
import payslipRoutes from './routes/payslipRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================

// Authentication routes
app.use('/api/auth', authRoutes);

// User management routes
app.use('/api/users', userRoutes);

// Leave management routes
app.use('/api/leave', leaveRoutes);

// Compliance management routes
app.use('/api/compliance', complianceRoutes);

// Payslip management routes
app.use('/api/payslip', payslipRoutes);

// Chatbot routes
app.use('/api/chat', chatRoutes);

// ============================================
// HEALTH CHECK & INFO ROUTES
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        message: 'Personnel System API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Root endpoint - API information
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Personnel Management System API',
        version: '1.0.0',
        documentation: 'https://github.com/yourusername/personnel-system',
        endpoints: {
            authentication: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me'
            },
            users: {
                getAll: 'GET /api/users',
                getOne: 'GET /api/users/:id',
                updateProfile: 'PUT /api/users/profile',
                updatePassword: 'PUT /api/users/password',
                updateUser: 'PUT /api/users/:id',
                deleteUser: 'DELETE /api/users/:id'
            },
            leaves: {
                create: 'POST /api/leave',
                getAll: 'GET /api/leave',
                getOne: 'GET /api/leave/:id',
                update: 'PUT /api/leave/:id',
                cancel: 'DELETE /api/leave/:id'
            },
            compliance: {
                create: 'POST /api/compliance',
                getAll: 'GET /api/compliance',
                complete: 'PUT /api/compliance/:id/complete',
                update: 'PUT /api/compliance/:id',
                delete: 'DELETE /api/compliance/:id'
            },
            payslips: {
                create: 'POST /api/payslip',
                getAll: 'GET /api/payslip',
                getOne: 'GET /api/payslip/:id',
                update: 'PUT /api/payslip/:id',
                delete: 'DELETE /api/payslip/:id'
            },
            chat: {
                sendMessage: 'POST /api/chat',
                history: 'GET /api/chat/history',
                feedback: 'PUT /api/chat/:id/feedback',
                analytics: 'GET /api/chat/analytics'
            }
        }
    });
});

// Debug route to view all data (Development only!)
// ⚠️ Remove this in production
app.get('/api/debug/all', async (req, res) => {
    try {
        const users = await mongoose.connection.collection('users').find().toArray();
        const leaves = await mongoose.connection.collection('leaverequests').find().toArray();
        const compliances = await mongoose.connection.collection('compliances').find().toArray();
        const payslips = await mongoose.connection.collection('payslips').find().toArray();
        const chats = await mongoose.connection.collection('chatmessages').find().toArray();
        
        // Remove passwords from users
        const safeUsers = users.map(({ password, ...user }) => user);
        
        res.json({
            success: true,
            message: 'Debug data (Development only)',
            data: {
                users: safeUsers,
                leaves,
                compliances,
                payslips,
                chatMessages: chats
            },
            counts: {
                users: users.length,
                leaves: leaves.length,
                compliances: compliances.length,
                payslips: payslips.length,
                chatMessages: chats.length
            }
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            error: err.message 
        });
    }
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler - Route not found
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});

// Global Error Handler (Must be last)
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Personnel System Server Running                      ║
║                                                           ║
║   📍 Port: ${PORT}                                        ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                    ║
║   📊 Database: Connected                                  ║
║                                                           ║
║   📡 API Endpoints:                                       ║
║      • http://localhost:${PORT}/                           ║
║      • http://localhost:${PORT}/api/health                 ║
║      • http://localhost:${PORT}/api/debug/all (dev only)   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`❌ Unhandled Rejection Error: ${err.message}`);
    server.close(() => {
        mongoose.connection.close();
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error(`❌ Uncaught Exception Error: ${err.message}`);
    server.close(() => {
        mongoose.connection.close();
        process.exit(1);
    });
});

// Handle SIGTERM (for deployment)
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        mongoose.connection.close();
        console.log('✅ Process terminated');
        process.exit(0);
    });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received. Shutting down gracefully...');
    server.close(() => {
        mongoose.connection.close();
        console.log('✅ Process terminated');
        process.exit(0);
    });
});

export default app;