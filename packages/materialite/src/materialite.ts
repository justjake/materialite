import { IThirdPartySource } from "./source/IThirdPartySource";

export class Materialite {
  constructor() {}

  // Create a new in-memory source
  newSource() {}

  // User provided source
  // If source.comparator matches comparator we can use source directly
  connect<T>(source: IThirdPartySource<T>, comparator: Comparator<T, T>) {}
}
