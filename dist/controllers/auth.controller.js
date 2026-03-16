"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../config/prisma");
class AuthController {
    async signup(req, res) {
        try {
            const { name, email, password } = req.body;
            // Validation
            if (!name || !email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Name, email, and password are required',
                });
                return;
            }
            if (password.length < 8) {
                res.status(400).json({
                    success: false,
                    message: 'Password must be at least 8 characters',
                });
                return;
            }
            // Check if user already exists
            const existingUser = await prisma_1.prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: 'User with this email already exists',
                });
                return;
            }
            // Hash password
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            // Create user in database
            const newUser = await prisma_1.prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            });
            console.log('✅ New user created in database:', email);
            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                },
            });
        }
        catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create account',
            });
        }
    }
    async signin(req, res) {
        try {
            const { email, password } = req.body;
            // Find user in database
            const user = await prisma_1.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                });
                return;
            }
            // Verify password
            const isValidPassword = await bcrypt_1.default.compare(password, user.password);
            if (!isValidPassword) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                });
                return;
            }
            console.log('✅ User signed in from database:', email);
            res.status(200).json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            });
        }
        catch (error) {
            console.error('Signin error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to sign in',
            });
        }
    }
}
exports.AuthController = AuthController;
