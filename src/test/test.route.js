import { testController } from "./test.controller.js";
import e from "express";

export const testRouter = e.Router();

testRouter.route("/").get(testController);
