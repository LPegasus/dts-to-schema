export class StringBuilder {
  public append(txt: string) {
    this._chunks.push(txt);
    return this;
  }

  public appendLine(txt: string = "") {
    this._chunks.push(txt + "\n");
    return this;
  }

  public toString() {
    return this._chunks.join("");
  }

  public clean() {
    this._chunks.length = 0;
    return this;
  }

  constructor() {}

  protected _chunks: string[] = [];
}
