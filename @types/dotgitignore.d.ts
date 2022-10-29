declare module 'dotgitignore' {
  interface Checker {
    ignore(fn: string): boolean;
  }
  function dgi(): Checker;

  export default dgi;
}
