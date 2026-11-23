const express = require("express");
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/expenseController");

const router = express.Router();
router.use(auth);
router.route("/").get(controller.list).post(controller.create);
router.route("/:id").put(controller.update).delete(controller.remove);
module.exports = router;
