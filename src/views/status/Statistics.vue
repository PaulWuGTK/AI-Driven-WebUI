<script setup lang="ts">
</script>

<template>
  <div class="status-page">
    <h2>Network Statistics</h2>
    <div class="content-box">
      <p>Traffic Statistics</p>
      <table>
        <thead>
          <tr>
            <th>Interface</th>
            <th>Received</th>
            <th>Transmitted</th>
            <th>Packets</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>WAN</td>
            <td>1.2 GB</td>
            <td>234 MB</td>
            <td>45,678</td>
          </tr>
          <tr>
            <td>LAN</td>
            <td>890 MB</td>
            <td>156 MB</td>
            <td>23,456</td>
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