<script lang="ts">
import { defineComponent, type PropType } from 'vue';

interface TreeNodeType {
  node: {
    Name: string;
    Alias: string;
    Active: boolean;
    IPAddress: string;
    PhysAddress: string;
    Tags: string;
    Parent: string;
    Level: number;
    NodeType: string;
    MediaType: string;
  };
  children: TreeNodeType[];
}

export default defineComponent({
  name: 'TreeNodeItem',
  props: {
    treeNode: { type: Object as PropType<TreeNodeType>, required: true },
    getIcon: { type: Function as PropType<(n: any) => string>, required: true },
    getTypeLabel: { type: Function as PropType<(n: any) => string>, required: true },
    t: { type: Function as PropType<(key: string) => string>, required: true },
    qa: { type: Function as PropType<(key: string) => string | undefined>, required: true },
  },
});
</script>

<template>
  <div class="tree-node" :data-testid="qa('topology-node-' + treeNode.node.Alias)">
    <div class="node-card" :class="{ 'node-inactive': !treeNode.node.Active, ['node-' + treeNode.node.NodeType]: true }">
      <span class="node-icon">{{ getIcon(treeNode.node) }}</span>
      <div class="node-info">
        <span class="node-name">{{ treeNode.node.Name }}</span>
        <span class="node-meta">
          <span class="node-type-badge">{{ getTypeLabel(treeNode.node) }}</span>
          <span v-if="treeNode.node.IPAddress" class="node-ip">{{ treeNode.node.IPAddress }}</span>
          <span v-if="treeNode.node.PhysAddress && treeNode.node.NodeType === 'device'" class="node-mac">{{ treeNode.node.PhysAddress }}</span>
        </span>
      </div>
      <span class="node-status-dot" :class="treeNode.node.Active ? 'dot-active' : 'dot-inactive'"></span>
    </div>
    <div v-if="treeNode.children.length > 0" class="tree-children">
      <TreeNodeItem
        v-for="child in treeNode.children"
        :key="child.node.Alias"
        :tree-node="child"
        :get-icon="getIcon"
        :get-type-label="getTypeLabel"
        :t="t"
        :qa="qa"
      />
    </div>
  </div>
</template>

<style scoped>
.tree-node {
  position: relative;
}

.tree-children {
  padding-left: 2rem;
  border-left: 2px solid #e0e0e0;
  margin-left: 1.25rem;
}

.tree-children .tree-node {
  position: relative;
}

.tree-children .tree-node::before {
  content: '';
  position: absolute;
  top: 1.25rem;
  left: -2rem;
  width: 2rem;
  height: 0;
  border-top: 2px solid #e0e0e0;
}

.node-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  margin: 0.3rem 0;
  border-radius: 6px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  transition: box-shadow 0.2s;
  max-width: 500px;
}

.node-card:hover {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.node-card.node-self {
  background: #e8f4fd;
  border-color: #0070BB;
}

.node-card.node-device {
  background: #f0f9ff;
  border-color: #93c5fd;
}

.node-card.node-inactive {
  opacity: 0.55;
}

.node-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  width: 2rem;
  text-align: center;
}

.node-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  flex: 1;
}

.node-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.node-type-badge {
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  background: #f0f0f0;
  color: #666;
  font-weight: 500;
}

.node-ip,
.node-mac {
  font-size: 0.75rem;
  color: #666;
  font-family: 'Courier New', Courier, monospace;
}

.node-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-active {
  background-color: #4caf50;
}

.dot-inactive {
  background-color: #ccc;
}

@media (max-width: 768px) {
  .tree-children {
    padding-left: 1rem;
    margin-left: 0.75rem;
  }

  .tree-children .tree-node::before {
    left: -1rem;
    width: 1rem;
  }

  .node-card {
    max-width: 100%;
  }
}
</style>
