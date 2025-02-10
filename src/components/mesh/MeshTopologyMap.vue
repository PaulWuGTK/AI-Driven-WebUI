<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MeshNode } from '../../types/mesh';
import { select, Selection } from 'd3-selection';
import { zoom } from 'd3-zoom';
import { drag, DragBehavior } from 'd3-drag';
import { 
  forceSimulation, 
  forceLink, 
  forceManyBody, 
  forceCenter,
  forceX,
  forceY,
  Simulation,
  SimulationNodeDatum,
  SimulationLinkDatum
} from 'd3-force';

// Define custom node type that extends SimulationNodeDatum
interface D3Node extends SimulationNodeDatum, MeshNode {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

// Define custom link type
interface D3Link extends SimulationLinkDatum<D3Node> {
  mediaType: string;
}

const { t } = useI18n();

const props = defineProps<{
  nodes: MeshNode[];
}>();

const svgContainer = ref<HTMLDivElement | null>(null);
const hoveredNode = ref<MeshNode | null>(null);
const hoverPosition = ref({ x: 0, y: 0 });
const simulation = ref<Simulation<D3Node, D3Link> | null>(null);

// Constants for node sizes and layout
const NODE_SIZES = {
  Controller: 60,
  Agent: 48,
  Client: 40
};

// Load images
const controllerIcon = new URL('/src/assets/icons/mesh_map/controller.png', import.meta.url).href;
const agentIcon = new URL('/src/assets/icons/mesh_map/agent.png', import.meta.url).href;
const clientIcon = new URL('/src/assets/icons/mesh_map/client.png', import.meta.url).href;

const getNodeIcon = (nodeType: string) => {
  switch (nodeType) {
    case 'Controller': return controllerIcon;
    case 'Agent': return agentIcon;
    case 'Client': return clientIcon;
    default: return clientIcon;
  }
};

const getNodeSize = (nodeType: string) => {
  return NODE_SIZES[nodeType as keyof typeof NODE_SIZES] || NODE_SIZES.Client;
};

// Prepare nodes and links for D3
const prepareNodesAndLinks = () => {
  // Create a map of nodes for quick lookup
  const nodeMap = new Map<string, D3Node>();
  
  // First create all nodes with D3Node interface
  props.nodes.forEach(node => {
    nodeMap.set(node.MACAddress, { ...node });
  });

  // Create links array ensuring both source and target nodes exist
  const links: D3Link[] = props.nodes
    .filter(node => node.Upstream !== '-' && nodeMap.has(node.Upstream))
    .map(node => ({
      source: nodeMap.get(node.Upstream)!,
      target: nodeMap.get(node.MACAddress)!,
      mediaType: node.MediaType
    }));

  return { nodes: Array.from(nodeMap.values()), links };
};

const createSimulation = (width: number, height: number) => {
  const { nodes, links } = prepareNodesAndLinks();

  // Create simulation with proper typing
  const sim = forceSimulation<D3Node>()
    .nodes(nodes)
    .force('link', forceLink<D3Node, D3Link>(links)
      .id(d => d.MACAddress)
      .distance(90))
    .force('charge', forceManyBody().strength(-700))
    .force('center', forceCenter(width / 2, height / 2))
    .force('y', forceY().strength(0.1))
    .force('x', forceX().strength(0.1));

  return { simulation: sim, nodes, links };
};

// Create drag behavior with proper typing
const createDragBehavior = () => {
  return drag<SVGGElement, D3Node>()
    .on('start', (event: any, d: D3Node) => {
      if (!event.active && simulation.value) {
        simulation.value.alphaTarget(0.3).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
    })
    .on('drag', (event: any, d: D3Node) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on('end', (event: any, d: D3Node) => {
      if (!event.active && simulation.value) {
        simulation.value.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
    });
};

const renderChart = () => {
  if (!svgContainer.value) return;

  // Stop any existing simulation
  if (simulation.value) {
    simulation.value.stop();
  }

  // Clear previous content
  select(svgContainer.value).selectAll('*').remove();

  const containerWidth = svgContainer.value.clientWidth;
  const containerHeight = svgContainer.value.clientHeight;

  // Create SVG
  const svg = select(svgContainer.value)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', [0, 0, containerWidth, containerHeight]);

  // Create container group for zoom
  const g = svg.append('g');

  // Add zoom behavior
  const zoomBehavior = zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoomBehavior as any);

  // Create simulation and get prepared nodes and links
  const { simulation: sim, nodes, links } = createSimulation(containerWidth, containerHeight);
  simulation.value = sim;

  // Create links
  const link = g.selectAll('.link')
    .data(links)
    .join('line')
    .attr('class', 'link')
    .style('stroke', d => d.mediaType === 'Wi-Fi' ? '#4CAF50' : '#2196F3')
    .style('stroke-width', 2)
    .style('stroke-dasharray', d => d.mediaType === 'Wi-Fi' ? '5,5' : '');

  // Create node groups with properly typed drag behavior
  const dragBehavior = createDragBehavior();
  const node = g.selectAll<SVGGElement, D3Node>('.node')
    .data(nodes)
    .join('g')
    .attr('class', 'node')
    .call(dragBehavior as any);

  // Add images to nodes
  node.append('image')
    .attr('xlink:href', d => getNodeIcon(d.Mode))
    .attr('width', d => getNodeSize(d.Mode))
    .attr('height', d => getNodeSize(d.Mode))
    .attr('x', d => -getNodeSize(d.Mode) / 2)
    .attr('y', d => -getNodeSize(d.Mode) / 2);

  // Add labels
  node.append('text')
    .text(d => d.Name)
    .attr('text-anchor', 'middle')
    .attr('dy', d => getNodeSize(d.Mode) / 2 + 20)
    .style('font-size', '12px')
    .style('fill', '#333');

  // Add hover events
  node.on('mouseover', (event, d) => {
    hoveredNode.value = d;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    hoverPosition.value = {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY
    };
  })
  .on('mouseout', () => {
    hoveredNode.value = null;
  });

  // Update positions on tick
  sim.on('tick', () => {
    link
      .attr('x1', d => (d.source as D3Node).x!)
      .attr('y1', d => (d.source as D3Node).y!)
      .attr('x2', d => (d.target as D3Node).x!)
      .attr('y2', d => (d.target as D3Node).y!);

    node
      .attr('transform', d => `translate(${d.x},${d.y})`);
  });
};

// Watch for changes in nodes
watch(() => props.nodes, () => {
  renderChart();
}, { deep: true });

// Handle window resize
const handleResize = () => {
  renderChart();
};

onMounted(() => {
  renderChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (simulation.value) {
    simulation.value.stop();
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="topology-map">
    <div ref="svgContainer" class="svg-container"></div>

    <div 
      v-if="hoveredNode"
      class="node-tooltip"
      :style="{
        left: `${hoverPosition.x + 10}px`,
        top: `${hoverPosition.y + 10}px`
      }"
    >
      <div class="tooltip-content">
        <div><strong>{{ hoveredNode.Name }}</strong></div>
        <div>Mode: {{ hoveredNode.Mode }}</div>
        <div>IP: {{ hoveredNode.ipv4 }}</div>
        <div>MAC: {{ hoveredNode.MACAddress }}</div>
        <div>Media Type: {{ hoveredNode.MediaType }}</div>
        <div v-if="hoveredNode.SupportedBand">Band: {{ hoveredNode.SupportedBand }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topology-map {
  position: relative;
  width: 100%;
  height: 600px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.svg-container {
  width: 100%;
  height: 100%;
}

.node-tooltip {
  position: fixed;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 1000;
  font-size: 0.9rem;
}

.tooltip-content {
  color: #333;
  line-height: 1.4;
}

:deep(.link) {
  pointer-events: none;
}

:deep(.node) {
  cursor: pointer;
}

:deep(.node text) {
  pointer-events: none;
}
</style>