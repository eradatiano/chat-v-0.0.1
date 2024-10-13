const express = require("express");
// const createError = require("http-errors");
const path = require("path");
// const cookieParser = require("cookie-parser");
// const logger = require("morgan");
const csv = require("@fast-csv/format");
const { parse } = require("fast-csv");
const fs = require("fs");
// const clientData = require("./public/javascripts/client")
// const indexRouter = require("./routes/index");
// const usersRouter = require("./routes/users");

const app = express();
app.use(express.json());
app.use(express.static(__dirname + "/public"));

// view engine setup
// app.set("views", path.join(__dirname, "views"));
// // app.set("view engine", "jade");
// app.set()

// app.use(logger("dev"));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

// app.use("/", indexRouter);
// app.use("/users", usersRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });

class CsvFile {
  static write(filestream, rows, options) {
    return new Promise((res, rej) => {
      csv
        .writeToStream(filestream, rows, options)
        .on("error", (err) => rej(err))
        .on("finish", () => res());
    });
  }

  constructor(opts) {
    this.headers = opts.headers;
    this.path = opts.path;
    this.writeOpts = { headers: this.headers, includeEndRowDelimiter: true };
  }

  create(rows) {
    return CsvFile.write(fs.createWriteStream(this.path), rows, {
      ...this.writeOpts,
    });
  }

  append(rows) {
    return CsvFile.write(
      fs.createWriteStream(this.path, { flags: "a" }),
      rows,
      {
        ...this.writeOpts,
        // dont write the headers when appending
        writeHeaders: false,
      }
    );
  }

  read() {
    return new Promise((res, rej) => {
      fs.readFile(this.path, (err, contents) => {
        if (err) {
          return rej(err);
        }
        return res(contents.toString());
      });
    });
  }
}

const sendAllMessages = function (userId) {
  let n = 0;
  let allMessages = {};
  const promise = fs
    .createReadStream(path.join(__dirname, "public/little-db.csv"))
    .pipe(parse())
    .on("data", (row) => {
      // let isSender = false;
      if (row.length === 0) return;
      // row[1] === userId && (isSender = true);
      const id = row[1];

      const message = row[2];
      allMessages[n] = [message, id];
      n += 1;
    })
    .on("end", () => {
      fs.writeFileSync(
        path.join(__dirname, "public/allMessages.json"),
        JSON.stringify(allMessages, null, 2)
      );
      // console.log("promise ended");
    });
  if (promise) {  // here is a problem that i can't figure out now 
    // console.log('json sent');
    return 1;
  };
};

const csvFile = new CsvFile({
  headers: { ignoreEmpty: true },
  path: path.resolve(__dirname, "public/little-db.csv"),
  // headers to write
  headers: ["username", "userId", "message"],
});

app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
});
// ali1727mir
app.post("/login", (req, res) => {
  const { username, userId } = req.body;
  // console.log(userId);
  if (sendAllMessages(userId)) {
    // console.log("block running");
    res
      .status(200)
      .sendFile(path.join(__dirname, "public", "allMessages.json"));
  }
});
app.get("/getMsg", (req, res) => { 
  const { userid } = req.headers;
  // console.log(userid);
  res.status(200).sendFile(path.join(__dirname, "public", "allMessages.json"));
})
let a = 0;
app.post("/send-getMsg", (req, res) => {
  const { username, userId, message } = req.body;
  const updateCsv = csvFile.append([
    { username: username, userId: userId, message: message },
  ]);
  if (updateCsv && sendAllMessages(userId)) {
    a++;
    // console.log(`update ${a}`);
    res
      .status(200)
      .sendFile(path.join(__dirname, "public", "allMessages.json"));
  }
  // console.log(username, userId, message);
});

app.listen(3000, () => {
  console.log(`Server running at http://localhost:${3000}/`);
});

// for (let i = 0; i < 1000; i++) {
// setInterval(() => {
// }, 2)

// }
// const b = fs.createReadStream(path.join(__dirname, "public/test1.csv"))
//   .pipe(parse())
//   .on("data", (row) => {
//     const a = row[2]
//     return a
//   });
// b.then((c) => console.log(c))
