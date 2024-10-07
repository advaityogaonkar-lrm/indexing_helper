import e from "express";
import {
  createFinalConfig,
  createInitialConfig,
  createReindexingJobList,
} from "./configs.controller.js";

export const router = e.Router();
router.route("/initial").post(createInitialConfig);
router.route("/final").post(createFinalConfig);
router.route("/joblist").post(createReindexingJobList);
