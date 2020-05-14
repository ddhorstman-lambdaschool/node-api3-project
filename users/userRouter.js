const router = require("express").Router();
const userDB = require("./userDb");
const postDB = require("../posts/postDb");
const Validator = require("jsonschema").Validator;

router.post("/", validateUser, (req, res, next) => {
  userDB
    .insert(req.body)
    .then(user => res.status(201).json(user))
    .catch(e => next({ ...e, status: 500, message: "Database error" }));
});

router.post("/:id/posts", validateUserId, validatePost, (req, res, next) => {
  postDB
    .insert({ ...req.body, user_id: req.user.id })
    .then(post => res.status(201).json(post))
    .catch(e => next({ ...e, status: 500, message: "Database error" }));
});

router.get("/", async (req, res, next) => {
  try {
    res.status(200).json({users: await userDB.get()});
  } catch (e) {
    next({ ...e, status: 500, message: "Database error" });
  }
});

router.get("/:id", validateUserId, async (req, res) => {
  res.status(200).json(req.user);
});

router.get("/:id/posts", validateUserId, (req, res, next) => {
  userDB
    .getUserPosts(req.user.id)
    .then(posts => res.status(200).json(posts))
    .catch(e => next({ ...e, status: 500, message: "Database error" }));
});

router.delete("/:id", validateUserId, async (req, res, next) => {
  try {
    await userDB.remove(req.user.id);
    res.status(200).json(req.user);
  } catch (e) {
    next({ ...e, status: 500, message: "Database error" });
  }
});

router.put("/:id", validateUserId, validateUser, async (req, res, next) => {
  try {
    const count = await userDB.update(req.user.id, req.body);
    if (count === 1) {
      res.status(200).json(await userDB.getById(req.user.id));
    } else {
      throw new Error("Not updated successfully");
    }
  } catch (e) {
    next({ ...e, status: 500, message: "Database error" });
  }
});

//custom middleware

async function validateUserId(req, res, next) {
  const { id } = req.params;
  try {
    const user = await userDB.getById(id);
    req.user = user;
    user
      ? next()
      : next({ status: 404, message: `${id} is not a valid user ID` });
  } catch (e) {
    next({ ...e, status: 500, message: "Database error" });
  }
}

const userSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
    },
  },
  required: ["name"],
};

async function validateUser(req, res, next) {
  const v = new Validator();
  const { errors } = v.validate(req.body, userSchema);
  if (errors.length !== 0) {
    next({ status: 400, message: "Missing required 'name' field", errors });
  } else {
    const users = await userDB.get();
    users.find(user => user.name === req.body.name)
      ? next({
          status: 400,
          message: `A user named '${req.body.name}' already exists.`,
        })
      : next();
  }
}

const postSchema = {
  type: "object",
  properties: {
    text: {
      type: "string",
    },
  },
  required: ["text"],
};

function validatePost(req, res, next) {
  const v = new Validator();
  const { errors } = v.validate(req.body, postSchema);
  errors.length === 0
    ? next()
    : next({ status: 400, message: "Missing required 'text' field", errors });
}

module.exports = router;
