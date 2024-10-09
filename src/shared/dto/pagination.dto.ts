export class Pagination<T> {
  items: T[];
  totalItems: number;

  constructor(result: [T[], number]) {
    (this.items = result[0]), (this.totalItems = result[1]);
  }
}
