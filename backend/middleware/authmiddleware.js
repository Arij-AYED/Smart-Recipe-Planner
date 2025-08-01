const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = (req,res,next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split (' ')[1];

  if (!token) {
    return res.status(401).json({error: 'Access denied, no token provided'});

  }
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  }catch (err) {
    return res.status(403).json({error: 'Invalid token'});
  }
};
const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { verifyAdmin };
