const router = require("express").Router();
const userDB = require("./userDb");

router.post("/", validateUser, (req, res) => {
  // do your magic!
});

router.post("/:id/posts", (req, res) => {
  // do your magic!
});

router.get("/", (req, res, next) => {
  userDB
    .get()
    .then(users => res.status(200).json(users))
    .catch(e => {
      next({
        ...e,
        status: 500,
        message: "Database error",
      });
    });
});

router.get("/:id", validateUserId, async (req, res) => {
  res.status(200).json(req.user);
});

router.get("/:id/posts", (req, res) => {
  // do your magic!
});

router.delete("/:id", (req, res) => {
  // do your magic!
});

router.put("/:id", (req, res) => {
  // do your magic!
});

//custom middleware

async function validateUserId(req, res, next) {
  const { id } = req.params;
  const user = await userDB.getById(id);
  req.user = user;
  user
    ? next()
    : next({ status: 404, message: `${id} is not a valid user ID` });
}

function validateUser(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    next({ status: 404, message: "Missing user data" });
  } else if (!req.body.name) {
    next({ status: 404, message: "Missing required 'name' field" });
  } else next();
}

function validatePost(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    next({ status: 404, message: "Missing post data" });
  } else if (!req.body.text) {
    next({ status: 404, message: "Missing required 'text' field" });
  } else next();
}

module.exports = router;
