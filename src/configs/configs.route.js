import e from "express";
import { createNewConfig } from "./configs.controller.js";

export const router = e.Router();
router.route("/").post(createNewConfig);
