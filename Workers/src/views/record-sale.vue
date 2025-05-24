```vue
<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header Section -->
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-sky-700">Sales Records</h1>
      <p class="text-gray-600 text-sm mt-2">View your sales history</p>
    </div>

    <!-- Filter Controls -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <div class="flex flex-wrap gap-2 mb-4 md:mb-0">
        <button
          @click="setFilter('daily')"
          class="px-4 py-1.5 text-sm font-semibold rounded-full"
          :class="{
            'bg-sky-600 text-white': filter === 'daily',
            'bg-gray-100 text-gray-700': filter !== 'daily'
          }"
        >
          Today
        </button>
        <button
          @click="setFilter('last4Days')"
          class="px-4 py-1.5 text-sm font-semibold rounded-full"
          :class="{
            'bg-sky-600 text-white': filter === 'last4Days',
            'bg-gray-100 text-gray-700': filter !== 'last4Days'
          }"
        >
          Last 4 Days
        </button>
        <button
          @click="setFilter('allTime')"
          class="px-4 py-1.5 text-sm font-semibold rounded-full"
          :class="{ 'bg-purple-600 text-white': filter === 'allTime', 'bg-purple-100 text-purple-700': filter !== 'allTime' }"
        >
          All Time
        </button>
      </div>
      <div class="text-sm text-gray-600">
        Showing {{ filteredSalesRecords.length }} records
      </div>
    </div>

    <!-- Sales Records Section -->
    <div v-if="salesStore.loading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="bg-gray-50 p-4 rounded-lg animate-pulse">
        <div class="h-4 bg-gray-200 rounded-full w-3/4 mb-2"></div>
        <div class="h-3 bg-gray-200 rounded-full w-1/2"></div>
      </div>
    </div>

    <div v-else-if="filteredSalesRecords.length === 0" class="text-center py-12 bg-white rounded-xl border border-gray-200">
      <svg class="h-12 w-12 mx-auto text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-700 mb-1">No sales records found</h3>
      <p class="text-gray-600 text-sm">Try adjusting your filters or check back later</p>
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 class="text-lg font-semibold text-gray-800">Sales Records</h2>
        <span class="text-sm text-gray-600">{{ filteredSalesRecords.length }} records</span>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subtype</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Qty</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="record in filteredSalesRecords" :key="record.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ record.productType }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ record.productSubtype }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ record.quantitySold }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ record.date }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ formatSaleTime(record.saleTime) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSalesStore } from '@/stores/salesStore';

const salesStore = useSalesStore();
const filter = ref('last4Days');

const filteredSalesRecords = computed(() => {
  if (!salesStore.sales || salesStore.sales.length === 0) {
    return [];
  }

  const now = new Date();
  const fiveDaysAgo = new Date(now);
  fiveDaysAgo.setDate(now.getDate() - 5);

  return salesStore.sales
    .filter((sale) => {
      const saleDate = new Date(sale.saleTime);
      if (filter.value === 'daily') {
        return saleDate.toDateString() === now.toDateString();
      } else if (filter.value === 'last4Days') {
        return saleDate >= fiveDaysAgo && saleDate <= now;
      } else if (filter.value === 'allTime') {
        return true; // Return all sales for "All Time"
      }
      return true;
    })
    .map((sale) => ({
      ...sale,
      date: new Date(sale.saleTime).toLocaleDateString(),
      time: new Date(sale.saleTime).toLocaleTimeString(),
    }))
    .sort((a, b) => new Date(b.saleTime) - new Date(a.saleTime));
});

const setFilter = async (value) => {
  filter.value = value;
  if (value === 'allTime') {
    await salesStore.fetchAllTimeSales();
  } else {
    await salesStore.fetchSales();
  }
};

const formatSaleTime = (saleTime) => {
  const options = { hour: '2-digit', minute: '2-digit', hour12: true };
  return new Date(saleTime).toLocaleTimeString(undefined, options);
};

onMounted(async () => {
  await salesStore.fetchSales();
});
</script>
```