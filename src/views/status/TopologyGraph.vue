<script setup lang="ts">
import { computed, ref } from 'vue';
import type { NetworkTopologyNode } from '../../types/networkTopology';

interface TreeNode {
  node: NetworkTopologyNode;
  children: TreeNode[];
}

interface LNode {
  node: NetworkTopologyNode;
  x: number;
  y: number;
  children: LNode[];
}

interface Edge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const props = defineProps<{
  root: TreeNode;
}>();

const hoveredAlias = ref<string | null>(null);

const H_GAP = 200;
const V_GAP = 54;
const PAD = { t: 50, r: 150, b: 50, l: 60 };

function countLeaves(n: TreeNode): number {
  if (n.children.length === 0) return 1;
  return n.children.reduce((s, c) => s + countLeaves(c), 0);
}

function treeDepth(n: TreeNode): number {
  if (n.children.length === 0) return 0;
  return 1 + Math.max(...n.children.map(treeDepth));
}

function layout(n: TreeNode, level: number, yMin: number, yMax: number): LNode {
  const x = PAD.l + level * H_GAP;
  if (n.children.length === 0) {
    return { node: n.node, x, y: (yMin + yMax) / 2, children: [] };
  }
  const total = countLeaves(n);
  const range = yMax - yMin;
  let cur = yMin;
  const kids: LNode[] = [];
  for (const ch of n.children) {
    const leaves = countLeaves(ch);
    const h = (leaves / total) * range;
    kids.push(layout(ch, level + 1, cur, cur + h));
    cur += h;
  }
  const y = (kids[0].y + kids[kids.length - 1].y) / 2;
  return { node: n.node, x, y, children: kids };
}

function collect(ln: LNode): { nodes: LNode[]; edges: Edge[] } {
  const nodes: LNode[] = [ln];
  const edges: Edge[] = [];
  for (const ch of ln.children) {
    edges.push({ x1: ln.x, y1: ln.y, x2: ch.x, y2: ch.y });
    const sub = collect(ch);
    nodes.push(...sub.nodes);
    edges.push(...sub.edges);
  }
  return { nodes, edges };
}

const graph = computed(() => {
  const depth = treeDepth(props.root);
  const leaves = countLeaves(props.root);
  const h = Math.max(420, leaves * V_GAP + PAD.t + PAD.b);
  const w = Math.max(600, (depth + 1) * H_GAP + PAD.l + PAD.r);
  const tree = layout(props.root, 0, PAD.t, h - PAD.b);
  const { nodes, edges } = collect(tree);
  return { nodes, edges, w, h };
});

function r(type: string): number {
  if (type === 'self') return 24;
  if (type === 'device') return 18;
  if (type === 'upnp') return 14;
  return 14;
}

function color(n: NetworkTopologyNode): string {
  if (!n.Active) return '#94a3b8';
  switch (n.NodeType) {
    case 'self': return '#0070BB';
    case 'device': return '#0891b2';
    case 'interface':
      if (n.MediaType === 'Wi-Fi') return '#16a34a';
      if (n.MediaType === 'Ethernet') return '#ea580c';
      if (n.MediaType === 'Bridge') return '#7c3aed';
      return '#64748b';
    case 'upnp': return '#d97706';
    default: return '#64748b';
  }
}

function icon(n: NetworkTopologyNode): string {
  switch (n.NodeType) {
    case 'self': return '\u{1F3E0}';
    case 'device': return '\u{1F4BB}';
    case 'interface':
      if (n.MediaType === 'Wi-Fi') return '\u{1F4F6}';
      if (n.MediaType === 'Ethernet') return '\u{1F50C}';
      if (n.MediaType === 'Bridge') return '\u{1F310}';
      return '\u{1F517}';
    case 'upnp': return '\u{1F4E1}';
    default: return '\u{2753}';
  }
}

function shortName(n: NetworkTopologyNode): string {
  const name = n.Name;
  return name.length > 20 ? name.substring(0, 18) + '\u2026' : name;
}

function tip(n: NetworkTopologyNode): string {
  const p = [n.Name];
  if (n.IPAddress) p.push('IP: ' + n.IPAddress);
  if (n.PhysAddress) p.push('MAC: ' + n.PhysAddress);
  if (n.MediaType) p.push('Type: ' + n.MediaType);
  p.push('Status: ' + (n.Active ? 'Active' : 'Inactive'));
  return p.join('\n');
}

function curve(e: Edge): string {
  const mx = (e.x1 + e.x2) / 2;
  return `M${e.x1},${e.y1} C${mx},${e.y1} ${mx},${e.y2} ${e.x2},${e.y2}`;
}
</script>

<template>
  <div class="topo-wrap">
    <svg :width="graph.w" :height="graph.h" :viewBox="`0 0 ${graph.w} ${graph.h}`">
      <!-- Connection lines -->
      <path
        v-for="(e, i) in graph.edges"
        :key="'e' + i"
        :d="curve(e)"
        fill="none"
        stroke="#cbd5e1"
        stroke-width="2"
      />

      <!-- Nodes -->
      <g
        v-for="n in graph.nodes"
        :key="n.node.Alias"
        :transform="`translate(${n.x},${n.y})`"
        class="gnode"
        @pointerenter="hoveredAlias = n.node.Alias"
        @pointerleave="hoveredAlias = null"
      >
        <!-- Glow ring on hover -->
        <circle
          v-if="hoveredAlias === n.node.Alias"
          :r="r(n.node.NodeType) + 4"
          :fill="color(n.node)"
          opacity="0.15"
        />
        <!-- Main circle -->
        <circle
          :r="r(n.node.NodeType)"
          :fill="color(n.node)"
          stroke="white"
          stroke-width="2.5"
          :opacity="n.node.Active ? 1 : 0.4"
          class="ncircle"
        />
        <!-- Icon inside circle -->
        <text
          text-anchor="middle"
          dy="0.35em"
          :font-size="n.node.NodeType === 'self' ? 16 : 12"
          class="nicon"
        >{{ icon(n.node) }}</text>
        <!-- Label to the right -->
        <text
          :x="r(n.node.NodeType) + 8"
          dy="0.35em"
          font-size="11"
          fill="#334155"
          font-weight="500"
          class="nlabel"
        >{{ shortName(n.node) }}</text>
        <!-- IP beneath label (if device or self) -->
        <text
          v-if="n.node.IPAddress && (n.node.NodeType === 'device' || n.node.NodeType === 'self')"
          :x="r(n.node.NodeType) + 8"
          :y="14"
          font-size="9"
          fill="#94a3b8"
          class="nlabel"
        >{{ n.node.IPAddress }}</text>
        <!-- Native tooltip -->
        <title>{{ tip(n.node) }}</title>
      </g>
    </svg>

    <!-- Legend -->
    <div class="legend">
      <span class="legend-item">
        <span class="legend-dot" style="background:#0070BB"></span>Gateway
      </span>
      <span class="legend-item">
        <span class="legend-dot" style="background:#7c3aed"></span>Bridge
      </span>
      <span class="legend-item">
        <span class="legend-dot" style="background:#ea580c"></span>Ethernet
      </span>
      <span class="legend-item">
        <span class="legend-dot" style="background:#16a34a"></span>Wi-Fi
      </span>
      <span class="legend-item">
        <span class="legend-dot" style="background:#0891b2"></span>Device
      </span>
    </div>
  </div>
</template>

<style scoped>
.topo-wrap {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 650px;
  position: relative;
}

.gnode {
  cursor: pointer;
}

.ncircle {
  transition: filter 0.15s;
}

.gnode:hover .ncircle {
  filter: brightness(1.1);
}

.nicon {
  pointer-events: none;
  user-select: none;
}

.nlabel {
  pointer-events: none;
  user-select: none;
}

.legend {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 1rem;
  flex-wrap: wrap;
  border-top: 1px solid #e2e8f0;
  margin-top: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: #64748b;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
