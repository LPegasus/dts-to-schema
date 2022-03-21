declare namespace Base {
  export interface Payload {
    data: any;
    ip: string;
    regions: string[];
  }
  interface Payload2 {
    payloads: Payload[];
  }
  interface Payload2 {
    _: Array<Payload>;
  }
}
