<script setup lang="ts">
</script>

<template>
  <div class="status-page">
    <h2>Mesh Network Information</h2>
    <div class="content-box">
      <p>Mesh Network Status</p>
      <table>
        <thead>
          <tr>
            <th>Node ID</th>
            <th>Role</th>
            <th>Connected Devices</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Node_001</td>
            <td>Controller</td>
            <td>5</td>
            <td>Active</td>
          </tr>
          <tr>
            <td>Node_002</td>
            <td>Agent</td>
            <td>3</td>
            <td>Active</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.status-page {
  padding: 2rem;
  background-color: #f5f5f5;
  flex: 1;
}

.content-box {
  background-color: white;
  border-radius: 4px;
  padding: 1.5rem;
  margin-top: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f9f9f9;
  font-weight: 500;
  color: #666;
}

td {
  color: #333;
}
</style>