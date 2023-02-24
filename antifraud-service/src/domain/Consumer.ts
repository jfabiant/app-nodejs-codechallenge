export class Consumer {
  constructor(
    public key?: string,
    public value?: string,
    public partition?: number,
    public topic?: string
  ) {}
}
