<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
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
const ICON_SIZE = 32;
const NODE_RADIUS = ICON_SIZE / 2;

let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let offsetX = 0;
let offsetY = 0;

const controllerIcon = new Image();
const agentIcon = new Image();
const clientIcon = new Image();

let flowPoints: Map<string, number> = new Map();

const handleMouseDown = (event: MouseEvent) => {
  isDragging = true;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
};

const handleMouseUp = () => {
  isDragging = false;
};

const setCanvasSize = () => {
  if (canvas.value) {
    const ratio = window.devicePixelRatio || 1;
    canvas.value.width = canvas.value.offsetWidth * ratio;
    canvas.value.height = 600 * ratio;
    const ctx = canvas.value.getContext("2d");
    if (ctx) {
      ctx.scale(ratio, ratio); // 缩放逻辑坐标
    }
  }
};

const drawConnectionWithFlow = (
  ctx: CanvasRenderingContext2D,
  start: { x: number, y: number },
  end: { x: number, y: number },
  flowKey: string,
  mediaType: string
) => {
  const distance = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );
  const progress = flowPoints.get(flowKey) || 0;
  const flowSpeed = 2;
  const nextProgress = (progress + flowSpeed) % distance;
  flowPoints.set(flowKey, nextProgress);

  ctx.beginPath();
  if (mediaType === "Wi-Fi") {
    ctx.strokeStyle = "#4CAF50";
    ctx.setLineDash([5, 5]);
  } else if (mediaType === "Ethernet") {
    ctx.strokeStyle = "#2196F3";
    ctx.setLineDash([]);
  }
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.setLineDash([]);

  const flowRatio = nextProgress / distance;
  const flowX = start.x + (end.x - start.x) * flowRatio;
  const flowY = start.y + (end.y - start.y) * flowRatio;
  ctx.beginPath();
  ctx.fillStyle = "#000";
  ctx.arc(flowX, flowY, 3, 0, Math.PI * 2);
  ctx.fill();
};

const handleMouseMoveOver = (event: MouseEvent) => {
  if (!canvas.value) return;

  // 实时获取画布的边界
  const rect = canvas.value.getBoundingClientRect();

  const x = (event.clientX - rect.left) - offsetX;
  const y = (event.clientY - rect.top) - offsetY;

  let found = false;
  for (const [mac, pos] of nodePositions.value.entries()) {
    const distance = Math.sqrt(
      Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)
    );

    if (distance <= ICON_SIZE / 2) {
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

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging) return;

  const dx = event.clientX - lastMouseX;
  const dy = event.clientY - lastMouseY;

  offsetX += dx;
  offsetY += dy;

  lastMouseX = event.clientX;
  lastMouseY = event.clientY;

  drawMap();
};

const handleResize = () => {
  if (canvas.value) {
    canvas.value.width = canvas.value.offsetWidth;
    canvas.value.height = canvas.value.offsetHeight;
    drawMap();
  }
};

const ensureMinimumDistance = (positions: Map<string, { x: number, y: number }>, minDistance = 50) => {
  const nodesArray = Array.from(positions.values());
  for (let i = 0; i < nodesArray.length; i++) {
    for (let j = i + 1; j < nodesArray.length; j++) {
      const posA = nodesArray[i];
      const posB = nodesArray[j];
      const dx = posA.x - posB.x;
      const dy = posA.y - posB.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        const angle = Math.atan2(dy, dx);
        const offset = (minDistance - distance) / 2;
        posA.x += Math.cos(angle) * offset;
        posA.y += Math.sin(angle) * offset;
        posB.x -= Math.cos(angle) * offset;
        posB.y -= Math.sin(angle) * offset;
      }
    }
  }
};

const calculateNodePositions = () => {
  if (!canvas.value) return;

  const positions = new Map<string, { x: number, y: number }>();
  const width = canvas.value.width;
  
  const controller = props.nodes.find(n => n.Mode === 'Controller');
  if (!controller) return;

  positions.set(controller.MACAddress, {
    x: width / 2,
    y: LEVEL_HEIGHT
  });

  const directAgents = props.nodes.filter(n => 
    n.Mode === 'Agent' && n.Upstream === controller.MACAddress
  );

  const agentWidth = width / (directAgents.length + 1);
  directAgents.forEach((agent, index) => {
    positions.set(agent.MACAddress, {
      x: agentWidth * (index + 1),
      y: LEVEL_HEIGHT * 2
    });
  });

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

const adjustVerticalSpacing = (positions: Map<string, { x: number, y: number }>) => {
  const levels = new Map<number, string[]>();

  positions.forEach((pos, mac) => {
    const level = Math.round(pos.y / LEVEL_HEIGHT);
    if (!levels.has(level)) levels.set(level, []);
    levels.get(level)?.push(mac);
  });

  levels.forEach((macAddresses, level) => {
    const step = canvas.value!.width / (macAddresses.length + 1);
    macAddresses.forEach((mac, index) => {
      const pos = positions.get(mac);
      if (pos) {
        pos.x = step * (index + 1);
      }
    });
  });
};

const adjustCanvasSize = () => {
  // 移除动态高度计算，确保始终为 600
  if (canvas.value && canvas.value.height !== 600) {
    canvas.value.height = 600;
    drawMap(); // 重绘画布
  }
};

const handleVisibilityChange = () => {
  if (document.visibilityState === "visible") {
    setCanvasSize();
  }
};

const drawNode = (ctx: CanvasRenderingContext2D, node: MeshNode, pos: { x: number, y: number }) => {
  const adjustedPos = {
    x: pos.x + offsetX,
    y: pos.y + offsetY,
  };

  if (node.Upstream !== '-') {
    const upstreamPos = nodePositions.value.get(node.Upstream);
    if (upstreamPos) {
      const adjustedUpstreamPos = {
        x: upstreamPos.x + offsetX,
        y: upstreamPos.y + offsetY,
      };
      const flowKey = `${node.Upstream}->${node.MACAddress}`;
      drawConnectionWithFlow(ctx, adjustedUpstreamPos, adjustedPos, flowKey, node.MediaType);
    }
  }

  const icon = node.Mode === 'Controller' ? controllerIcon :
               node.Mode === 'Agent' ? agentIcon : clientIcon;
  if (icon.complete) {
    ctx.drawImage(icon, adjustedPos.x - ICON_SIZE / 2, adjustedPos.y - ICON_SIZE / 2, ICON_SIZE, ICON_SIZE);
  } else {
    ctx.beginPath();
    ctx.fillStyle = node.Mode === 'Controller' ? '#0070BB' :
                   node.Mode === 'Agent' ? '#4CAF50' : '#FFA000';
    ctx.arc(adjustedPos.x, adjustedPos.y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }
};

const drawMap = () => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  props.nodes.forEach((node) => {
    const pos = nodePositions.value.get(node.MACAddress);
    if (pos) {
      drawNode(ctx, node, pos);
    }
  });
};

const animateFlow = () => {
  drawMap();
  requestAnimationFrame(animateFlow);
};

watch(() => props.nodes, drawMap, { deep: true });

import controllerIconPath from '../../assets/icons/controller.png';
import agentIconPath from '../../assets/icons/agent.png';
import clientIconPath from '../../assets/icons/client.png';

onMounted(() => {
  document.addEventListener("visibilitychange", handleVisibilityChange);
  if (document.visibilityState === "visible" && canvas.value) {
      setCanvasSize();
    }
  controllerIcon.src = controllerIconPath;
  agentIcon.src = agentIconPath;
  clientIcon.src = clientIconPath;

  Promise.all([
    new Promise(resolve => { controllerIcon.onload = resolve; }),
    new Promise(resolve => { agentIcon.onload = resolve; }),
    new Promise(resolve => { clientIcon.onload = resolve; })
  ]).then(() => {
    if (canvas.value) {
      setCanvasSize();
      canvas.value.width = canvas.value.offsetWidth;
      canvas.value.height = canvas.value.offsetHeight;
      
      calculateNodePositions();
      ensureMinimumDistance(nodePositions.value, 60);

      flowPoints = new Map();
      props.nodes.forEach(node => {
        if (node.Upstream && node.Upstream !== '-') {
          const flowKey = `${node.Upstream}->${node.MACAddress}`;
          flowPoints.set(flowKey, 0);
        }
      });

      adjustCanvasSize();
      drawMap();
      animateFlow();
    }
  });

  if (canvas.value) {
    canvas.value.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", handleResize);
  }
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  if (canvas.value) {
    canvas.value.removeEventListener("mousedown", handleMouseDown);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("resize", handleResize);
  }
});
</script>

<template>
  <div class="topology-map">
    <canvas 
      ref="canvas"
      @mousemove="handleMouseMoveOver"
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