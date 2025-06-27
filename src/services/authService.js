const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                isAdmin: user.is_admin
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                is_admin: user.is_admin
            }
        };
    };
}



module.exports = authService