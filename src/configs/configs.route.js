import e from "express";
import {
  createFinalConfig,
  createInitialConfig,
} from "./configs.controller.js";

export const router = e.Router();
router.route("/").post(createInitialConfig);
router.route("/final").post(createFinalConfig);
