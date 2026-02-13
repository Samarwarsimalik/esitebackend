const isAdminOrClient = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "client") {
    return next();
  }
  res.status(403).json({ msg: "Access denied" });
};

module.exports = { isAdminOrClient };
