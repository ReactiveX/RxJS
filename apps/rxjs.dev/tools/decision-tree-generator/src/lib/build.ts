import { addUniqueId } from './addUniqueId.js';
import { extractInitialSequence } from './extractInitialSequence.js';
import { FlattenedApiList, DecisionTree, TreeNodeRaw } from './interfaces.js';
import { decisionTreeReducer } from './decisionTreeReducer.js';

/**
 * Main build script, outputs the decision tree.
 *
 * @export
 * @param {FlattenedApiList} apiList
 * @param {Tree} tree
 * @requires addUniqueId
 * @requires extractInitialSequence
 * @requires decisionTreeReducer
 * @returns {DecisionTree}
 */
export function build(apiList: FlattenedApiList, tree: TreeNodeRaw[]): DecisionTree {
  const nodesWithUniqueIds = addUniqueId(tree);
  const initialOption = extractInitialSequence(nodesWithUniqueIds);

  return {
    ...decisionTreeReducer(nodesWithUniqueIds, apiList),
    [initialOption.id]: { ...initialOption },
  };
}
