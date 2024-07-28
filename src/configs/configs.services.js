import fs from "fs/promises";
import { exec } from "child_process";
import { initialConfigTemplate } from "./constants.js";
import { promisify } from "util";
import path from "path";
import { XMLValidator, XMLParser, XMLBuilder } from "fast-xml-parser";
import { finalConfigValues } from "../../ignore/constants.js";

// Promsifying exec
const asyncExec = promisify(exec);
const parser = new XMLParser();
const builder = new XMLBuilder({
  format: true,
});

const XML_DECLARATION = '<?xml version="1.0" encoding="utf-8"?>';
const xmlRegex = /^<\?xml[^>]*\?>/;

// HELPER METHODS

async function readAndParseXML(filePath) {
  let xmlContent = await fs.readFile(filePath, "utf-8");
  xmlContent = xmlContent.replace(xmlRegex, "");
  return parser.parse(xmlContent);
}

// SAVE XML CONTENT
async function saveXml(filePath, xmlObject) {
  let xmlContent = builder.build(xmlObject);
  validateXML(xmlContent);
  xmlContent = `${XML_DECLARATION}${xmlContent}`;
  await fs.writeFile(filePath, xmlContent, "utf-8");
}

// CREATE DIRECTORY
async function createDirectory(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

// VALIDATE XML
function validateXML(xmlString) {
  const validate = XMLValidator.validate(xmlString, {
    allowBooleanAttributes: true,
  });
  if (validate !== true) {
    throw new Error(validate.err);
  }
  return true;
}

// Copy config
async function copyConfig(source, destination, configName = "") {
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

// Method mappings

const methods = {
  initial_config: (body) => createInitialConfig(body),
  final_config: (body) => createFinalConfig(body),
};

// PROCESS MULTIPLE CONFIG
export async function createConfig(body, configtype) {
  const collections = body;

  try {
    const results = await Promise.allSettled(
      collections.map((collection) => methods[configtype](collection))
    );

    let fulfilledResults = [];
    let rejectedResults = [];

    fulfilledResults = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);
    rejectedResults = results
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason);

    return { fulfilledResults, rejectedResults };
  } catch (error) {
    console.log();
    return error;
  }
}

// Create Final Config
export async function createFinalConfig(collection) {
  const { treeroot, configName } = collection;

  try {
    let finalConfigTemplate = await fs.readFile(
      `${process.env.SDE_MAIN}${configName}/default.xml`,
      "utf-8"
    );

    finalConfigTemplate = finalConfigTemplate.replace(/^<\?xml[^>]*\?>/, "");
    let parsedFinalConfig = parser.parse(finalConfigTemplate);
    parsedFinalConfig = {
      Sinequa: {
        ...parsedFinalConfig.Sinequa,
        ...finalConfigValues,
      },
    };

    let finalConfig = builder.build(parsedFinalConfig);
    finalConfig = `${XML_DECLARATION}${finalConfig}`;

    // SAVE FILE
    const filename = "default.xml";
    const dirPath = `${process.env.SDE_MAIN}${configName}`;
    const filePath = path.join(dirPath, filename);
    await copyConfig(dirPath, process.env.FINAL_CONFIG_BACKUP, configName);
    await fs.writeFile(filePath, finalConfig, "utf-8");
    return configName;
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("file not found");

      const filename = `default.xml`;
      const dirPath = `${process.env.SDE_MAIN}${configName}`;
      const filePath = path.join(dirPath, filename);
      await fs.mkdir(dirPath, { recursive: true });

      let finalConfigTemplate = await fs.readFile(
        process.env.FINAL_CONFIG_TEMPLATE,
        "utf-8"
      );

      finalConfigTemplate = finalConfigTemplate.replace(/^<\?xml[^>]*\?>/, "");
      let parsedConfig = parser.parse(finalConfigTemplate);
      parsedConfig = {
        Sinequa: {
          ...parsedConfig.Sinequa,
          treeRoot: treeroot,
        },
      };

      let finalConfig = builder.build(parsedConfig);
      finalConfig = `${XML_DECLARATION}${finalConfig}`;

      // SAVE FILE
      await fs.writeFile(filePath, finalConfig, "utf-8");
      return configName;
    } else {
      console.log("error while processing final config : ", error);
      throw new Error("Error while creating final config");
    }
  }
}

// Create initial config
export async function createInitialConfig(body) {
  const { treeroot, url, configName } = body;

  try {
    let initialConfigTemplate = await readAndParseXML(
      process.env.INITIAL_CONFIG_TEMPLATE
    );

    initialConfigTemplate.Sinequa = {
      ...initialConfigTemplate.Sinequa,
      treeRoot: treeroot,
      Url: url,
    };

    // let modifiedConfig = builder.build(initialConfigTemplate);

    // modifiedConfig = `<?xml version="1.0" encoding="utf-8"?>${modifiedConfig}`;
    // validateXML(modifiedConfig);

    const dirPath = `${process.env.TEMP_INITIAL_CONFIG_FOLDER}${configName}`;
    const filePath = path.join(dirPath, "default.xml");

    await createDirectory(dirPath);
    await saveXml(filePath, initialConfigTemplate);
    // await fs.writeFile(filePath, modifiedConfig);
    await copyConfig(dirPath, process.env.SDE_MAIN, configName);

    return configName;
  } catch (error) {
    console.error("Error storing file : ", error);
    throw new Error("Error storing file");
  }
}
