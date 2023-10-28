// TODO: we need to understand if the ordering by which
// we need data from the source matches the ordering of the
// source.
// TODO: do we allow dupes in a third party source or only unique values?
// TODO: if only unique, comparator must be able to distinguish between
// two values that are equal and not the same identity.
export interface IThirdPartySource<T> {
  onAdd(): void;
  onRemove(): void;
  // onReplace(): void;

  /**
   * The comparator that is used to sort the source.
   * If the source is already sorted by this comparator
   * we can avoid doing full scans over the source.
   *
   * The comparator must first compare by the ordering criteria
   * and then, if ordering criteria is equal, by primary key
   * of the data.
   *
   * @param a
   * @param b
   * @returns
   */
  readonly comparator: (a: T, b: T) => number;
  scan(options: {
    from?: T;
    limit?: number;
    direction?: "asc" | "desc";
  }): Iterable<T>;
}

export interface ISource<T> {
  add(x: T): void;
  remove(x: T): void;

  readonly stream: DifferenceStream<T>;
}
