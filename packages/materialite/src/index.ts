// Top level APIs
export { Materialite } from "./materialite.js";
export { DifferenceStream } from "./core/graph/DifferenceStream.js";

// Sources
export { SetSource } from "./sources/StatelessSetSource.js";
export { ImmutableSetSource as PersistentSetSource } from "./sources/ImmutableSetSource.js";
export { MutableMapSource } from "./sources/MutableMapSource.js";
export type {
  IStatefulSource as IMemorableSource,
  ISource,
} from "./sources/Source.js";

// Views
export { PrimitiveView } from "./views/PrimitiveView.js";
export { PersistentTreeView } from "./views/PersistentTreeView.js";

// Re-Exports
export { PersistentTreap } from "@vlcn.io/ds-and-algos/PersistentTreap";
