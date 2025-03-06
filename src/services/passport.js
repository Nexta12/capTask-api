import bcrypt from "bcryptjs";
import { Strategy as LocalStrategy } from "passport-local";
import User from '../models/UserModel.js'

export function initialize(passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          // Trim email and find the user
          const user = await User.findOne({ email: email.trim() });

          if (!user) {
            return done(null, false, { message: "Wrong Credentials" });
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            return done(null, false, { message: "Incorrect Password" });
          }

          // If everything is correct, return the user
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Serialize user to store in the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}