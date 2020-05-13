const router = require("express").Router();
const postDB = require("./postDb");

router.get("/", async (req, res, next) => {
  try {
    res.status(200).json(await postDB.get());
  } catch (e) {
    next({ ...e, status: 500, message: "Database error" });
  }
});

router.get("/:id", validatePostId, (req, res) => {
  res.status(200).json(req.post);
});

router.delete("/:id", validatePostId, async (req, res) => {
  try {
    await postDB.remove(req.post.id);
    res.status(200).json(req.post);
  } catch (e) {
    next({ ...e, status: 500, message: "Database error" });
  }
});

router.put("/:id", validatePostId, validatePost, async (req, res, next) => {
  try {
    const count = await postDB.update(req.post.id, req.body);
    if (count === 1) {
      res.status(200).json(await postDB.getById(req.post.id));
    } else {
      throw new Error("Not updated successfully");
    }
  } catch (e) {
    next({ ...e, status: 500, message: "Database error" });
  }
});

// custom middleware

async function validatePostId(req, res, next) {
  const { id } = req.params;
  try {
    const post = await postDB.getById(id);
    req.post = post;
    post
      ? next()
      : next({ status: 404, message: `${id} is not a valid post ID` });
  } catch (e) {
    next({ ...e, status: 500, message: "Database error" });
  }
}

function validatePost(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    next({ status: 404, message: "Missing post data" });
  } else if (!req.body.text) {
    next({ status: 404, message: "Missing required 'text' field" });
  } else next();
}

module.exports = router;
