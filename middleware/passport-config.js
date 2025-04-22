const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/user");
require("dotenv").config();

const authOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  "jwt-auth",
  new Strategy(authOpts, async (payload, done) => {
    try {
      const fullUser = await User.findById(payload._id);
      if (fullUser) {
        const user = { _id: fullUser._id };
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

const refreshOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_REFRESH_SECRET,
};

passport.use(
  "jwt-refresh",
  new Strategy(refreshOpts, async (payload, done) => {
    try {
      const fullUser = await User.findById(payload._id);
      if (fullUser) {
        const user = { _id: fullUser._id };
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

module.exports = passport;
