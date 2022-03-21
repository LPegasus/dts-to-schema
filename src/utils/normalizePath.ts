export function normalizePath(path: string) {
  let p = path.replace(/\\/g, "/");

  if (process.platform === "win32") {
    p = p.replace(/^([a-zA-Z]:)/, "/$1");
  }

  if (!/^[./]/.test(p)) {
    p = "./" + p;
  }
  return p;
}
