import jwt from "jsonwebtoken";
import config from "./config";

const verifyToken = (req: any, res: any, next: any) => {
    let token = req.body?.token || req.query?.token || req.headers?.['x-access-token'];

    const authHeader = req.headers?.['authorization'];
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }

    if (!token) {
        return res.status(403).send("Token szükséges a hozzáféréshez!");
    }

    try {
        if (!config.jwtSecret) {
            return res.status(500).send("Hiba: nincs beállítva JWT titkos kulcs!");
        }

        const decodedToken: any = jwt.verify(token, config.jwtSecret);

        req.user = decodedToken;

        return next();
    } catch (err) {
        return res.status(401).send("Hibás vagy lejárt token");
    }
};

export default verifyToken;


