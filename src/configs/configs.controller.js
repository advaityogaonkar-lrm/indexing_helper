import { createConfig, createConfigRemastered } from "./configs.services.js";

export async function createNewConfig(req, res, next) {
  try {
    // await createConfig(req.body);
    const result = await createConfigRemastered(req.body);
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
