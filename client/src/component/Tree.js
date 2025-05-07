import React, { useState } from 'react';

const TreeNode = ({ node, onSelect, isSelected, isRoot }) => {
  const handleNodeClick = () => {
    onSelect(node);
  };

  return (
    <div>
      <div
        className={`tree-node ${isSelected ? 'selected' : ''} ${isRoot ? 'root' : ''}`}
        onClick={handleNodeClick}
      >
        {node.name}
      </div>
      {node.children && (
        <div className="tree-children">
          {node.children.map((childNode) => (
            <TreeNode key={childNode.id} node={childNode} onSelect={onSelect} isRoot={false} />
          ))}
        </div>
      )}
    </div>
  );
};

const Tree = ({ data, onSelect }) => {
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeSelect = (node) => {
    setSelectedNode(node === selectedNode ? null : node);
    onSelect(node);
  };

  return (
    <div className="tree-container">
      {data.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          onSelect={handleNodeSelect}
          isSelected={node === selectedNode}
          isRoot={true}  // Root nodes will get the 'root' class
        />
      ))}
    </div>
  );
};

export default Tree;
