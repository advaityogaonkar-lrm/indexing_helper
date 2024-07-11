import fs from "fs/promises";
import { exec } from "child_process";
import { initialConfigTemplate } from "./constants.js";
import { promisify } from "util";
import path from "path";
import { XMLValidator } from "fast-xml-parser";

// Promsifying exec
const asyncExec = promisify(exec);

// TODOS :
// Create config
export async function createConfig(body) {
  const { treeroot, url, configName } = body;
  const initialConfig = initialConfigTemplate(treeroot, url);
  const filename = `default.xml`;
  const dirPath = `${process.env.TEMP_INITIAL_CONFIG_FOLDER}${configName}`;
  const filePath = path.join(dirPath, filename);

  if (!validateXML(initialConfig)) {
    throw new Error("xml is invalid");
  }

  try {
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, initialConfig);
    await copyConfig(dirPath, process.env.SDE_MAIN, configName);
    console.log("config file created and moved successfully");
  } catch (error) {
    console.error("Error storing file : ", error);
    throw new Error("Error storing file");
  }
}
// Validate xml
function validateXML(xmlString) {
  try {
    XMLValidator.validate(xmlString, { allowBooleanAttributes: true });
    return true;
  } catch (error) {
    console.error("Invalid XML");
    return false;
  }
}

// Copy config
async function copyConfig(source, destination, configName) {
  const commandType = process.env.COMMAND_TYPE;
  let command = "";
  switch (commandType) {
    case "win": {
      command = `xcopy ${source} ${destination}${configName} /E /I /Y`;
      break;
    }
    case "linux": {
      command = `cp -r ${source} ${destination}`;
    }
  }

  console.log("breakpoint");

  try {
    const { stderr, stdout } = await asyncExec(command);
    if (stderr) {
      console.error("Stderr : ", stderr);
    }
    console.log("Stdout : ", stdout);
  } catch (error) {
    console.error("Error message: ", error.message);
    return false;
  }
}
