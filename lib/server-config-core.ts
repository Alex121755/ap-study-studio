/** Read per request so changing the environment never leaves a cached credential. */
export function readOpenAIKey(environment:Record<string,string|undefined>=process.env):string|undefined {
 return environment.OPENAI_API_KEY?.trim()||undefined;
}
