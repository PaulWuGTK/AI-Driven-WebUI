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
const NODE_RADIUS = 15;
const ICON_SIZE = 40;

let isDragging = false; // 是否正在拖动
let lastMouseX = 0; // 上一次鼠标的 X 坐标
let lastMouseY = 0; // 上一次鼠标的 Y 坐标
let offsetX = 0; // 画布 X 偏移
let offsetY = 0; // 画布 Y 偏移

const controllerIcon = new Image();
const agentIcon = new Image();
const clientIcon = new Image();

let flowPoints: Map<string, number> = new Map(); // 存储每条线上的点位置

const handleMouseDown = (event: MouseEvent) => {
  isDragging = true;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
};

const handleMouseUp = () => {
  isDragging = false;
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
  const flowSpeed = 2; // 数据流动速度
  const nextProgress = (progress + flowSpeed) % distance;
  flowPoints.set(flowKey, nextProgress);

  // 设置连线样式
  ctx.beginPath();
  if (mediaType === "Wi-Fi") {
    ctx.strokeStyle = "#4CAF50"; // 绿色
    ctx.setLineDash([5, 5]); // 虚线
  } else if (mediaType === "Ethernet") {
    ctx.strokeStyle = "#2196F3"; // 蓝色
    ctx.setLineDash([]); // 实线
  }
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.setLineDash([]); // 重置虚线样式

  // 绘制流动点
  const flowRatio = nextProgress / distance;
  const flowX = start.x + (end.x - start.x) * flowRatio;
  const flowY = start.y + (end.y - start.y) * flowRatio;
  ctx.beginPath();
  ctx.fillStyle = "#000"; // 小黑点
  ctx.arc(flowX, flowY, 3, 0, Math.PI * 2);
  ctx.fill();
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

const adjustVerticalSpacing = (positions: Map<string, { x: number, y: number }>) => {
  const levels = new Map<number, string[]>();

  // 根据 Y 坐标分层
  positions.forEach((pos, mac) => {
    const level = Math.round(pos.y / LEVEL_HEIGHT);
    if (!levels.has(level)) levels.set(level, []);
    levels.get(level)?.push(mac);
  });

  // 水平调整以避免重叠
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
  if (canvas.value) {
    const nodeCount = props.nodes.length;
    const newHeight = Math.max(600, nodeCount * 100); // 每个节点占据一定高度
    canvas.value.height = newHeight;
    drawMap();
  }
};

const drawNode = (ctx: CanvasRenderingContext2D, node: MeshNode, pos: { x: number, y: number }) => {
  const adjustedPos = {
    x: pos.x + offsetX,
    y: pos.y + offsetY,
  };

  // 绘制连接线
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

  // 绘制节点图标或圆
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

  // 清空画布
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  // 遍历每个节点，绘制节点和连接
  props.nodes.forEach((node) => {
    const pos = nodePositions.value.get(node.MACAddress);
    if (pos) {
      drawNode(ctx, node, pos);
    }
  });
};

const handleMouseMoveOver = (event: MouseEvent) => {
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

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging) return;

  // 计算拖动距离
  const dx = event.clientX - lastMouseX;
  const dy = event.clientY - lastMouseY;

  // 更新偏移量
  offsetX += dx;
  offsetY += dy;

  // 更新鼠标位置
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;

  // 重绘画布
  drawMap();
};

const handleResize = () => {
  if (canvas.value) {
    canvas.value.width = canvas.value.offsetWidth;
    canvas.value.height = canvas.value.offsetHeight;
    drawMap();
  }
};

watch(() => props.nodes, drawMap, { deep: true });

import controllerIconPath from '../../assets/icons/controller.png';
import agentIconPath from '../../assets/icons/agent.png';
import clientIconPath from '../../assets/icons/client.png';

const animateFlow = () => {
  drawMap(); // 重绘整个画布
  requestAnimationFrame(animateFlow); // 下一帧
};

onMounted(() => {
  controllerIcon.src = controllerIconPath;
  agentIcon.src = agentIconPath;
  clientIcon.src = clientIconPath;

  controllerIcon.onload = drawMap;
  agentIcon.onload = drawMap;
  clientIcon.onload = drawMap;

  if (canvas.value) {
    canvas.value.width = canvas.value.offsetWidth;
    canvas.value.height = canvas.value.offsetHeight;

    canvas.value.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // 初次计算节点位置并初始化流动点
    calculateNodePositions();
    ensureMinimumDistance(nodePositions.value, 60);

    // 初始化 flowPoints
    flowPoints = new Map();
    props.nodes.forEach(node => {
      if (node.Upstream && node.Upstream !== '-') {
        const flowKey = `${node.Upstream}->${node.MACAddress}`;
        flowPoints.set(flowKey, 0);
      }
    });

    adjustCanvasSize();
    drawMap(); // 初次绘制

    animateFlow(); // 启动动画
    window.addEventListener("resize", handleResize);
  }
});

onUnmounted(() => {
  if (canvas.value) {
    canvas.value.removeEventListener("mousedown", handleMouseDown);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
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