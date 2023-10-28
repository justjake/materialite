import { Version } from "../core/types.js";
import { materializeMutableArray } from "./updateMutableArray.js";
import { View } from "./View.js";

/**
 * A sink that materializes a stream of differences into a new copy of an array.
 */
export class CopyOnWriteArrayView<T> extends View<T, readonly T[]> {
  #data: readonly T[] = [];

  get data() {
    return this.#data;
  }

  protected run(version: Version) {
    const collections = this.reader.drain(version);
    if (collections.length === 0) {
      return;
    }

    const newData = [...this.#data];
    let changed = false;
    collections.forEach((collection) => {
      // now we incrementally update our sink.
      changed =
        materializeMutableArray(collection, newData, this.comparator) ||
        changed;
    });
    this.#data = newData;
    if (changed) {
      this.notify(newData);
    }
  }
}
