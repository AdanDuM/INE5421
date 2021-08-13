import { ReadTokens } from "../src/Lexer";
import { jsonToRegDef, openCodeFile } from "../src/utils/File";

it('TESTE', () => {
  const code = openCodeFile('exampleV2') || '';
  console.log(code)
  const regex = jsonToRegDef('exampleV2');
  console.log(regex)
  const tokens = ReadTokens(code, regex.definitions);
  console.log(tokens)
});
