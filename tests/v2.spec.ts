import { ReadTokens } from "../src/Lexer";
import { jsonToRegDef, openCodeFile } from "../src/utils/File";

it('TESTE', () => {
  const code = openCodeFile('example') || '';
  // console.log(code)
  const regex = jsonToRegDef('regular-definitions');
  // console.log(regex)
  const tokens = ReadTokens(code, regex.definitions);
  console.log(tokens)
});
