import { Hoisted } from "../core/graph/Msg.js";
import { RootDifferenceStream } from "../core/graph/RootDifferenceStream.js";
import { Entry, Multiset } from "../core/multiset.js";
import {
  ISourceInternal,
  MaterialiteForSourceInternal,
  Version,
} from "../core/types.js";
import { IStatefulSource, IUnsortedSource, KeyFn } from "./Source.js";

/**
 * A MapSource which retains values in a mutable structure.
 */
export class MutableMapSource<K, T>
  implements IStatefulSource<T, Map<K, T>>, IUnsortedSource<T, K>
{
  readonly _state = "stateful";
  readonly _sort = "unsorted";
  readonly #internal: ISourceInternal;
  readonly #materialite: MaterialiteForSourceInternal;
  readonly #listeners = new Set<(data: Map<K, T>) => void>();
  readonly keyFn: KeyFn<T, K>;

  #stream: RootDifferenceStream<T>;
  #pending: Entry<T>[] = [];
  #recomputeAll = false;
  #map: Map<K, T>;

  constructor(materialite: MaterialiteForSourceInternal, getKey: (t: T) => K) {
    this.#materialite = materialite;
    this.#stream = new RootDifferenceStream<T>(materialite.materialite, this);
    this.#map = new Map();
    this.keyFn = getKey;

    const self = this;
    this.#internal = {
      onCommitPhase1(version: Version) {
        for (let i = 0; i < self.#pending.length; i++) {
          const [val, mult] = self.#pending[i]!;
          // small optimization to reduce operations for replace
          if (i + 1 < self.#pending.length) {
            const [nextVal, nextMult] = self.#pending[i + 1]!;
            if (
              Math.abs(mult) === 1 &&
              mult === -nextMult &&
              getKey(val) === getKey(nextVal)
            ) {
              // Do we need this optimization for a regular map?
              self.#map.set(getKey(nextVal), nextMult > 0 ? nextVal : val);
              i += 1;
              continue;
            }
          }
          if (mult < 0) {
            self.#map.delete(getKey(val));
          } else if (mult > 0) {
            self.#map.set(getKey(val), val);
          }
        }

        if (self.#recomputeAll) {
          self.#pending = [];
          self.#stream.queueData([
            version,
            new Multiset(asEntries(self.#map), {
              cause: "full_recompute",
            }),
          ]);
        } else {
          self.#stream.queueData([version, new Multiset(self.#pending, null)]);
          self.#pending = [];
        }
      },
      // release queues by telling the stream to send data
      onCommitPhase2(version: Version) {
        if (self.#recomputeAll) {
          self.#recomputeAll = false;
          self.#stream.notify(version);
        } else {
          self.#stream.notify(version);
        }

        for (const l of self.#listeners) {
          l(self.#map);
        }
      },
      onRollback() {
        self.#pending = [];
      },
    };
  }

  get stream() {
    return this.#stream;
  }

  get data() {
    return this.#map;
  }

  detachPipelines() {
    this.#stream = new RootDifferenceStream<T>(
      this.#materialite.materialite,
      this
    );
  }

  onChange(cb: (data: Map<K, T>) => void) {
    this.#listeners.add(cb);
    return () => this.#listeners.delete(cb);
  }

  add(v: T): this {
    this.#pending.push([v, 1]);
    this.#materialite.addDirtySource(this.#internal);
    return this;
  }

  delete(v: T): this {
    this.#pending.push([v, -1]);
    this.#materialite.addDirtySource(this.#internal);
    return this;
  }

  resendAll(_msg: Hoisted): this {
    this.#recomputeAll = true;
    this.#materialite.addDirtySource(this.#internal);
    return this;
  }
}

function asEntries<K, V>(m: Map<K, V>) {
  function* gen() {
    for (const v of m.values()) {
      yield [v, 1] as const;
    }
  }
  return {
    *[Symbol.iterator]() {
      yield* gen();
    },
  };
}
