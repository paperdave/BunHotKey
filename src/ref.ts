export class Ref {
  timer = setInterval(() => {}, 2 ** 31 - 1);

  unref() {
    clearInterval(this.timer);
  }
}
