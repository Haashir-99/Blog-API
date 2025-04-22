// Desc: Middleware for authenticating JWT tokens

const passport = require("passport");

const authenticateJwt = async (req, res, next) => {
  passport.authenticate("jwt-auth", { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      const error = new Error("Not Logged In");
      error.statusCode = 401;
      return next(error);
    }
    
    req.user = user;
    return next();
  })(req, res, next);
};

module.exports = authenticateJwt;