const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class authService {
    static async findUserByEmail(email) {
        return prisma.user.findUnique({ where: { email } });
    }

    static async registerUser(name, email, password, isAdmin = false) {
        const existingUser = await this.findUserByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                is_admin: isAdmin
            },
        });
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            is_admin: user.is_admin
        };
    };

    static async loginUser(email, password) {
        const user = await this.findUserByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        // Generate tokens
        const { accessToken, refreshToken } = await this.generateTokens(user);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                is_admin: user.is_admin
            }
        };
    }

    /**
     * Generate access and refresh tokens
     */
    static async generateTokens(user) {
        // Generate access token (short-lived)
        const accessToken = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                isAdmin: user.is_admin
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Generate refresh token (long-lived, random string)
        const refreshTokenValue = crypto.randomBytes(64).toString('hex');
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 30); // 30 days

        // Store refresh token in database
        await prisma.refreshToken.create({
            data: {
                token: refreshTokenValue,
                userId: user.id,
                expiresAt: refreshTokenExpiry
            }
        });

        return {
            accessToken,
            refreshToken: refreshTokenValue
        };
    }

    /**
     * Refresh access token using refresh token
     */
    static async refreshToken(refreshTokenValue) {
        // Find refresh token in database
        const storedRefreshToken = await prisma.refreshToken.findUnique({
            where: { token: refreshTokenValue },
            include: { user: true }
        });

        if (!storedRefreshToken) {
            throw new Error('Invalid refresh token');
        }

        if (storedRefreshToken.isRevoked) {
            throw new Error('Refresh token has been revoked');
        }

        if (new Date() > storedRefreshToken.expiresAt) {
            // Token expired, clean it up
            await prisma.refreshToken.delete({
                where: { id: storedRefreshToken.id }
            });
            throw new Error('Refresh token expired');
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(storedRefreshToken.user);

        // Revoke old refresh token
        await prisma.refreshToken.update({
            where: { id: storedRefreshToken.id },
            data: { isRevoked: true }
        });

        return {
            accessToken,
            refreshToken: newRefreshToken,
            user: {
                id: storedRefreshToken.user.id,
                name: storedRefreshToken.user.name,
                email: storedRefreshToken.user.email,
                is_admin: storedRefreshToken.user.is_admin
            }
        };
    }

    /**
     * Revoke refresh token (logout)
     */
    static async revokeRefreshToken(refreshTokenValue) {
        await prisma.refreshToken.updateMany({
            where: { token: refreshTokenValue },
            data: { isRevoked: true }
        });
    }

    /**
     * Clean up expired refresh tokens
     */
    static async cleanupExpiredTokens() {
        const deletedCount = await prisma.refreshToken.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    { isRevoked: true }
                ]
            }
        });
        console.log(`Cleaned up ${deletedCount.count} expired/revoked refresh tokens`);
    };
}



module.exports = authService