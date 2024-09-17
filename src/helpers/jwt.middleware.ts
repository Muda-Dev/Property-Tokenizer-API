import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config();
const JWT_SECRET: any = process.env.JWT_SECRET;

export class JWTMiddleware {
    static verifyToken(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).send({ message: "No authorization header provided." });
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).send({ message: "Token format is 'Bearer <token>'." });
        }

        const token = parts[1];

        jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
            if (err) {
                return res.status(401).send({ message: "Unauthorized." });
            }
            req.body.user_id = decoded.id; //staff ID
            req.body.userId = decoded.user_id;
            req.body.company_id = decoded.company_id;

            console.log("QUERY==>USER==>",decoded.id)
            console.log("QUERY==>COMPANY==>",decoded.company_id)


            next();
        });
    }
}
