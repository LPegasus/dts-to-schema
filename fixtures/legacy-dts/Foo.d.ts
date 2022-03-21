declare namespace Foo {
  enum StatusEnum {
    Foo = 0,
    Bar = 1,
  }

  interface IFoo {
    /** @description payload desc */
    payload: Base.Payload;
    status: Foo.StatusEnum;
  }
}
