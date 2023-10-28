import { Comparator } from "@vlcn.io/ds-and-algos/types";
import { IThirdPartySource } from "./source/Source.js";

export class Materialite {
  constructor() {}

  // Create a new in-memory source
  newSource() {}

  // User provided source
  // If source.comparator matches comparator we can use source directly
  connect<T>(source: IThirdPartySource<T>, comparator: Comparator<T>) {}
}
