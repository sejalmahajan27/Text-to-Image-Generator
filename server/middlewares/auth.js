import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: 'Not Authorized. Token missing' });
    }

    const token = authHeader.split(" ")[1]; // ✅ extract token

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: 'Invalid Token. Login again' });
    }

    req.userId = decoded.id;
    next();

  } catch (error) {
    console.error('Auth Error:', error.message);
    return res.status(401).json({ success: false, message: 'Authentication Failed' });
  }
};

export default userAuth;
