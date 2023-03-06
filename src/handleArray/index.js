// returns true if the array contains any of the items in the subarray
export const includesAny = (arr, subarr) => {
  return subarr.some((item) => arr.includes(item))
}

// returns all the child node of the given node in a tree, where the tree is { id: string, childId: string[] }
const getChildNodeIds = (nodes, nodeId, visited = {}) => {
  if (visited[nodeId]) {
    // If the node has already been visited, return an empty array
    return []
  }

  // Mark the node as visited
  visited[nodeId] = true

  // Find the node object that matches the given nodeId
  const node = nodes.find((n) => n.nodeId === nodeId)

  if (!node) {
    // If no node found, return an empty array
    return []
  }

  const childNodeIds = node.childNodeIds || []

  // Recursively get child nodeIds of child nodes
  return childNodeIds.concat(
    childNodeIds.flatMap((id) => getChildNodeIds(nodes, id, visited)),
  )
}
