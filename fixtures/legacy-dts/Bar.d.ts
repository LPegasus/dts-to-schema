declare enum BarStatusEnum {
  Foo = 0,
  Bar = 1,
}

declare interface IBar {
  payload: Base.Payload;
  status: BarStatusEnum;
}
