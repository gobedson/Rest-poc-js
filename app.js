require("babel-register");
const { error, success } = require("functions");
const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const app = express();
const config = require("./config.json");

const members = [
  {
    id: 1,
    name: "Godson",
  },
  { id: 2, name: "Sophie" },
  { id: 3, name: "Jack" },
];
let MembersRouter = express.Router();
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

MembersRouter.route("/:id")
  // récupère un membre avec son id
  .get((req, res) => {
    const index = getIndex(req.params.id);
    if (typeof index == "string") {
      res.json(error(index));
    } else {
      res.json(success(members[index]));
    }
  })
  // modifie un membre avec son ID
  .put((req, res) => {
    console.log("start put ");
    let index = getIndex(req.params.id);
    if (typeof index == "string") {
      res.json(error(index));
    } else {
      let same = false;
      console.log(req.body.name);
      console.log(req.params.id);
      for (let i = 0; i < members.length; i++) {
        if (
          req.body.name == members[i].name &&
          req.params.id != members[i].id
        ) {
          same = true;
          break;
        }
      }
      if (same) {
        res.json(error("Same name"));
      } else {
        members[index].name = req.body.name;
        res.json(success(true));
      }
    }
  })
  // supprime un membre avec son ID
  .delete((req, res) => {
    const index = getIndex(req.params.id);
    if (typeof index == "string") {
      res.json(error(index));
    } else {
      members.splice(index, 1);
      res.json(success(members));
    }
  });

MembersRouter.route("/")
  //Ajoute un membre
  .post((req, res) => {
    if (req.body.name) {
      let sameName = false;
      for (let i = 0; i < members.length; i++) {
        if (members[i].name == req.body.name) {
          sameName = true;
          break;
        }
      }
      if (sameName) {
        res.json(error("name already taken"));
      } else {
        let member = { id: createId(), name: req.body.name };
        members.push(member);
        res.json(success(member));
      }
    } else {
      res.json(error("No name value"));
    }
  })
  // récupère tous les membres
  .get((req, res) => {
    if (req.query.max != undefined && req.query.max > 0) {
      res.json(success(members.slice(0, req.query.max)));
    } else if (req.query.max != undefined) {
      res.json(error("Wrong max value."));
    } else {
      res.json(success(members));
    }
  });

app.use(config.rootAPI + "members", MembersRouter);

app.listen(config.port, () => console.log("Started on port " + config.port));

function getIndex(id) {
  for (let i = 0; i < members.length; i++) {
    if (members[i].id == id) {
      return i;
    }
  }
  return "wrong id";
}

function createId() {
  return members[members.length - 1].id + 1;
}
