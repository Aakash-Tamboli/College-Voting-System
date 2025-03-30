const jwt = require("jsonwebtoken");

function jwtAuthentication(request, response, next) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const authorization = request.headers.authorization;

  if (!authorization)
    return response.status(401).json({ error: "Token not found" });

  const token = request.headers.authorization.split(" ")[1];

  if (!token) return response.status(401).json({ error: "Token not found" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    request.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    response.status(401).json({ error: "Invalid token" });
  }
}

function generateToken(userData) {
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: 30000 });
}

module.exports = {
  jwtAuthentication,
  generateToken,
};
