import fs from 'fs';
import path from 'path';

interface RegDef {
  definitions: [
    { regexp: string, name: string, priority: number }
  ];
}

const openJsonFile = (file: string) => {
  try {
    const pathToFile = path.join(__dirname, '..', '..', 'json', `${file}.json`);
    return fs.readFileSync(pathToFile, 'utf8');
  } catch (err) {
    console.error(err);
  }
};

const openCodeFile = (file: string) => {
  try {
    const pathToFile = path.join(__dirname, '..', '..', 'code', `${file}.cd`);
    return fs.readFileSync(pathToFile, 'utf8');
  } catch (err) {
    console.error(err);
  }
};

const jsonToRegDef = (json: string): RegDef => {
  const jsonRegDef = openJsonFile(json);
  return jsonRegDef ? JSON.parse(jsonRegDef) : '';
};

export { openJsonFile, openCodeFile, jsonToRegDef };
