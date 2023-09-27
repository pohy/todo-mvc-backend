const express = require("express");
const DbStore = require("nedb");
const cors = require("cors");
const uuid = require("uuid/v4");
const path = require("path");

const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, process.env.DATA_DIR ?? "data");
const app = express();
const db = new DbStore({
  autoload: true,
  filename: path.join(dataDir, "todo.db"),
});

app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function dbGetAll(res) {
  db.find({}, (err, doc) => {
    res.send(doc);
  });
}

function dbGetOne(res, _id) {
  db.findOne({ _id }, (err, doc) => {
    res.send(doc);
  });
}

app.get("/", (req, res) => {
  dbGetAll(res);
});

app.get("/:id", (req, res) => {
  dbGetOne(res, req.params.id);
});

app.post("/", (req, res) => {
  var id = uuid();
  const protocol = process.env.REQ_PROTOCOL ?? req.protocol;
  var doc = {
    ...req.body,
    completed: false,
    _id: id,
    id,
    url: protocol + "://" + req.get("host") + "/" + id,
  };
  db.insert(doc, (err, doc) => {
    res.send(doc);
  });
});

app.patch("/:id", (req, res) => {
  db.update({ _id: req.params.id }, { $set: req.body }, {}, (err, number) => {
    dbGetOne(res, req.params.id);
  });
});

app.delete("/", (req, res) => {
  db.remove({}, { multi: true }, (err, n) => {
    dbGetAll(res);
  });
});

app.delete("/:id", (req, res) => {
  db.remove({ _id: req.params.id }, {}, (err, n) => {
    dbGetOne(res, req.params.id);
  });
});

app.listen(PORT, () => {
  console.log("Server is running...");
});
