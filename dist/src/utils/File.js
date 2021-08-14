"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonToRegDef = exports.openCodeFile = exports.openJsonFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const openJsonFile = (file) => {
    try {
        const pathToFile = path_1.default.join(__dirname, '..', '..', 'json', `${file}.json`);
        return fs_1.default.readFileSync(pathToFile, 'utf8');
    }
    catch (err) {
        console.error(err);
    }
};
exports.openJsonFile = openJsonFile;
const openCodeFile = (file) => {
    try {
        const pathToFile = path_1.default.join(__dirname, '..', '..', 'code', `${file}.cd`);
        return fs_1.default.readFileSync(pathToFile, 'utf8');
    }
    catch (err) {
        console.error(err);
    }
};
exports.openCodeFile = openCodeFile;
const jsonToRegDef = (json) => {
    const jsonRegDef = openJsonFile(json);
    return jsonRegDef ? JSON.parse(jsonRegDef) : '';
};
exports.jsonToRegDef = jsonToRegDef;
