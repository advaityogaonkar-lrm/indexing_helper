import { test } from "./test.services.js";

export function testController(req, res, next) {
  res.status(200).json({
    status: "success",
    message: "test success",
  });
}
