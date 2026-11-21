// Собирается в scripts/bundle-api.mjs из pulse-archive/*.json.
declare module 'virtual:pulse-archive' {
  const builds: unknown[];
  export default builds;
}
