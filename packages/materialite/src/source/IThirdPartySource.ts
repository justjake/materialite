// TODO: we need to understand if the ordering by which
// we need data from the source matches the ordering of the
// source.
export interface IThirdPartySource<T> {
  onAdd(): void;
  onRemove(): void;
  onReplace(): void;

  readonly comparator: (a: T, b: T) => number;
  scan(): Iterable<T>;
}
