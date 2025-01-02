<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { defineProps } from 'vue';
import type { MeshNode } from '../../types/mesh';

const props = defineProps<{
  nodes: MeshNode[];
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
const hoveredNode = ref<MeshNode | null>(null);
const hoverPosition = ref({ x: 0, y: 0 });
const nodePositions = ref(new Map<string, { x: number, y: number }>());

const LEVEL_HEIGHT = 120;
const NODE_RADIUS = 15;
const ICON_SIZE = 20;

const calculateNodePositions = () => {
  if (!canvas.value) return;

  const positions = new Map<string, { x: number, y: number }>();
  const width = canvas.value.width;
  
  // Find controller
  const controller = props.nodes.find(n => n.Mode === 'Controller');
  if (!controller) return;

  // Position controller at top center
  positions.set(controller.MACAddress, {
    x: width / 2,
    y: LEVEL_HEIGHT
  });

  // Find direct agents (connected to controller)
  const directAgents = props.nodes.filter(n => 
    n.Mode === 'Agent' && n.Upstream === controller.MACAddress
  );

  // Position direct agents
  const agentWidth = width / (directAgents.length + 1);
  directAgents.forEach((agent, index) => {
    positions.set(agent.MACAddress, {
      x: agentWidth * (index + 1),
      y: LEVEL_HEIGHT * 2
    });
  });

  // Position other agents
  const otherAgents = props.nodes.filter(n =>
    n.Mode === 'Agent' && !directAgents.includes(n)
  );

  otherAgents.forEach(agent => {
    const upstreamPos = positions.get(agent.Upstream);
    if (upstreamPos) {
      positions.set(agent.MACAddress, {
        x: upstreamPos.x + (Math.random() * 100 - 50),
        y: upstreamPos.y + LEVEL_HEIGHT
      });
    }
  });

  // Position clients
  const clients = props.nodes.filter(n => n.Mode === 'Client');
  clients.forEach(client => {
    const upstreamPos = positions.get(client.Upstream);
    if (upstreamPos) {
      positions.set(client.MACAddress, {
        x: upstreamPos.x + (Math.random() * 80 - 40),
        y: upstreamPos.y + LEVEL_HEIGHT
      });
    }
  });

  nodePositions.value = positions;
};

const drawNode = (ctx: CanvasRenderingContext2D, node: MeshNode, pos: { x: number, y: number }) => {
  // Draw connection line
  if (node.Upstream !== '-') {
    const upstreamPos = nodePositions.value.get(node.Upstream);
    if (upstreamPos) {
      ctx.beginPath();
      ctx.strokeStyle = node.MediaType === 'Wi-Fi' ? '#4CAF50' : '#2196F3';
      ctx.setLineDash(node.MediaType === 'Wi-Fi' ? [5, 5] : []);
      ctx.moveTo(upstreamPos.x, upstreamPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Draw node circle
  ctx.beginPath();
  ctx.fillStyle = node.Mode === 'Controller' ? '#0070BB' : 
                 node.Mode === 'Agent' ? '#4CAF50' : '#FFA000';
  ctx.arc(pos.x, pos.y, NODE_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  // Draw icon
  ctx.fillStyle = 'white';
  ctx.font = `${ICON_SIZE}px Material Icons`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const icon = node.Mode === 'Controller' ? 'router' :
              node.Mode === 'Agent' ? 'wifi' : 'devices';
  ctx.fillText(icon, pos.x, pos.y);
};

const drawMap = () => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  // Calculate positions
  calculateNodePositions();

  // Draw all nodes and connections
  props.nodes.forEach(node => {
    const pos = nodePositions.value.get(node.MACAddress);
    if (pos) {
      drawNode(ctx, node, pos);
    }
  });
};

const handleMouseMove = (event: MouseEvent) => {
  if (!canvas.value) return;

  const rect = canvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Check if mouse is over any node
  let found = false;
  for (const [mac, pos] of nodePositions.value.entries()) {
    const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
    if (distance <= NODE_RADIUS) {
      const node = props.nodes.find(n => n.MACAddress === mac);
      if (node) {
        hoveredNode.value = node;
        hoverPosition.value = { x: event.clientX, y: event.clientY };
        found = true;
        break;
      }
    }
  }

  if (!found) {
    hoveredNode.value = null;
  }
};

const handleResize = () => {
  if (canvas.value) {
    canvas.value.width = canvas.value.offsetWidth;
    canvas.value.height = canvas.value.offsetHeight;
    drawMap();
  }
};

watch(() => props.nodes, drawMap, { deep: true });

onMounted(() => {
  if (canvas.value) {
    canvas.value.width = canvas.value.offsetWidth;
    canvas.value.height = canvas.value.offsetHeight;
    drawMap();
    window.addEventListener('resize', handleResize);
  }
});
</script>

<template>
  <div class="topology-map">
    <canvas 
      ref="canvas"
      @mousemove="handleMouseMove"
      @mouseleave="hoveredNode = null"
    ></canvas>

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

canvas {
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
</style>