import { createConfig } from "./configs.services.js";

export async function createInitialConfig(req, res, next) {
  try {
    // await createConfig(req.body);
    const result = await createConfig(req.body, "initial_config");
    res.status(200).json({
      status: "success",
      data: {
        message: "File created and moved successfully",
        ...result,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
}

export async function createFinalConfig(req, res, next) {
  try {
    const result = await createConfig(req.body, "final_config");
    res.status(200).json({
      status: "success",
      data: {
        message: "File created",
        ...result,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
    });
  }
}
