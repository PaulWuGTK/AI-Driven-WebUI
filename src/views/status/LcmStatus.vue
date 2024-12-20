<script setup lang="ts">
</script>

<template>
  <div class="status-page">
    <h2>LCM Status</h2>
    <div class="content-box">
      <p>LCM Configuration Status</p>
      <table>
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>LCM Mode</td>
            <td>Automatic</td>
            <td>Enabled</td>
          </tr>
          <tr>
            <td>Last Update</td>
            <td>2024-03-15 10:30:00</td>
            <td>Success</td>
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