const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const { formatDate, stripTags, truncate, editIcon } = require("./helpers/hbs");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const connectDB = require("./config/db");

// Load config
dotenv.config({ path: "./config/config.env" });

// Passport config
require("./config/passport")(passport);

connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Logging
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

// Handlebars
app.engine(
	".hbs",
	exphbs({
		helpers: { formatDate, truncate, stripTags, editIcon },
		defaultLayout: "main",
		extname: ".hbs",
	})
);
app.set("view engine", ".hbs");

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Sessions
app.use(
	session({
		secret: "super secret",
		resave: false,
		saveUninitialized: false,
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
	})
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global vars
app.use(function (req, res, next) {
	res.locals.user = req.user || null;
	next();
});

// Routes
app.use("/", require("./routes"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

const PORT = process.env.PORT || 3000;

app.listen(
	PORT,
	console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
