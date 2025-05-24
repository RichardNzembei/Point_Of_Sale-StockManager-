<template>
  <div class="container mx-auto p-4 max-w-7xl">
    <!-- Header Section -->
    <header class="mb-8">
      <h1 class="text-2xl md:text-3xl font-bold text-center text-rose-600 uppercase tracking-wider">
        <span class="inline-block bg-gradient-to-r from-rose-500 to-pink-500 text-transparent bg-clip-text">
          Main Dashboard
        </span>
      </h1>
      <p class="text-center text-gray-500 mt-2 text-sm md:text-base">
        Real-time Overview
      </p>
    </header>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- SALES OVERVIEW CARD -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-rose-50 transition-all hover:shadow-md">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-semibold text-xl text-gray-800 flex items-center">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-rose-50 mr-3">
              <svg class="h-6 w-6 text-rose-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
              </svg>
            </span>
            Sales Overview
          </h2>
          <span class="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 rounded-full px-4 py-1.5 text-sm font-semibold shadow-inner">
            Today's Sales
          </span>
        </div>

        <!-- Loading State -->
        <div v-if="salesStore.loading" class="space-y-4">
          <div v-for="n in 3" :key="n" class="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg animate-pulse">
            <div class="h-4 bg-rose-100 rounded-full w-3/4 mb-3"></div>
            <div class="h-3 bg-rose-100 rounded-full w-1/2"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="salesItems.length === 0" class="text-center py-8">
          <div class="inline-flex items-center justify-center p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl mb-3 shadow-inner">
            <svg class="h-8 w-8 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-gray-500 font-medium">No sales recorded for today</p>
          <p class="text-sm text-rose-400 mt-1">Start making sales to see data here</p>
        </div>

        <!-- Sales List -->
        <ul v-else class="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
          <li 
            v-for="sale in salesItems" 
            :key="sale.id" 
            class="bg-white p-4 rounded-lg border border-rose-100 flex justify-between items-center shadow-xs hover:shadow-sm transition-shadow"
          >
            <div>
              <div class="flex items-center mb-1">
                <span class="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 mr-2"></span>
                <strong class="text-gray-700 font-medium">{{ sale.productType.toUpperCase() }}</strong>
              </div>
              <p class="text-sm text-gray-600 pl-4">
                {{ sale.productSubtype.toUpperCase() }}:
                <span class="font-bold text-emerald-600 ml-1">{{ sale.quantitySold }}</span>
              </p>
            </div>
            <div class="text-sm font-medium text-gray-500 bg-rose-50 px-3 py-1 rounded-full shadow-inner">
              {{ formatSaleTime(sale.saleTime) }}
            </div>
          </li>
        </ul>
      </div>

      <!-- STOCK OVERVIEW CARD -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-rose-50 transition-all hover:shadow-md">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-semibold text-xl text-gray-800 flex items-center">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-rose-50 mr-3">
              <svg class="h-6 w-6 text-rose-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
              </svg>
            </span>
            Stock Overview
          </h2>
          <span class="text-sm text-rose-600 bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-1.5 rounded-full font-semibold shadow-inner">
            {{ Object.keys(stock).length }} Product Types
          </span>
        </div>

        <!-- Category Toggle Buttons -->
        <div class="flex flex-wrap gap-2 mb-6">
          <button 
            v-for="cat in availableCategories"
            :key="cat"
            @click="toggleCategory(cat)"
            :class="{ 
              'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md': activeCategory === cat, 
              'bg-rose-100 text-rose-700 hover:bg-rose-200': activeCategory !== cat 
            }"
            class="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="stockStore.loading" class="space-y-4">
          <div v-for="n in 2" :key="n" class="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg animate-pulse">
            <div class="h-4 bg-rose-100 rounded-full w-1/3 mb-3"></div>
            <div class="space-y-2.5">
              <div v-for="m in 3" :key="m" class="flex justify-between">
                <div class="h-4 bg-rose-100 rounded-full w-1/2"></div>
                <div class="h-4 bg-rose-100 rounded-full w-1/4"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="Object.keys(filteredStock).length === 0" class="text-center py-8">
          <div class="inline-flex items-center justify-center p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl mb-3 shadow-inner">
            <svg class="h-8 w-8 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p class="text-gray-500 font-medium">No stock data available</p>
          <p class="text-sm text-rose-400 mt-1">Add products to begin tracking inventory</p>
        </div>

        <!-- Stock List -->
        <ul v-else class="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          <li 
            v-for="(subtypes, productType) in filteredStock" 
            :key="productType" 
            class="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-100 shadow-xs"
          >
            <div class="flex justify-between items-center mb-3 pb-3 border-b border-rose-200">
              <h3 class="font-semibold text-gray-700 flex items-center">
                <svg class="h-5 w-5 mr-2 text-rose-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {{ productType.toUpperCase() }} ({{ categories[productType] || 'UNKNOWN' }})
              </h3>
            </div>

            <ul class="space-y-2.5">
              <li 
                v-for="(quantity, productSubtype) in subtypes" 
                :key="productSubtype" 
                class="flex justify-between items-center bg-white p-3 rounded-lg border border-rose-100 hover:shadow-xs transition-shadow"
              >
                <div class="flex-1">
                  <span class="font-medium text-gray-700">{{ productSubtype.toUpperCase() }}</span>
                </div>
                <div class="text-right min-w-[100px]">
                  <span 
                    v-if="quantity === 0" 
                    class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-100 to-rose-100 text-red-800 shadow-inner"
                  >
                    Out of Stock
                  </span>
                  <span 
                    v-else-if="quantity < 5" 
                    class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 shadow-inner"
                  >
                    Low Stock ({{ quantity }})
                  </span>
                  <span 
                    v-else 
                    class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 shadow-inner"
                  >
                    In Stock ({{ quantity }})
                  </span>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed } from "vue";
import { useStockStore } from "@/stores/stockStore";
import { useSalesStore } from "@/stores/salesStore";

const stockStore = useStockStore();
const salesStore = useSalesStore();

const stock = computed(() => stockStore.stock);
const categories = computed(() => stockStore.categories);
const availableCategories = computed(() => [...new Set(Object.values(categories.value).concat("ALL"))]);
const activeCategory = ref("ALL");

const salesItems = computed(() => {
  const today = new Date().setHours(0, 0, 0, 0);
  return salesStore.sales
    .filter((sale) => {
      try {
        const saleDate = new Date(sale.saleTime).setHours(0, 0, 0, 0);
        return saleDate === today;
      } catch {
        return false;
      }
    })
    .sort((a, b) => new Date(b.saleTime) - new Date(a.saleTime));
});

const filteredStock = computed(() => {
  if (activeCategory.value === "ALL") return stock.value;
  return Object.fromEntries(
    Object.entries(stock.value).filter(([productType]) => categories.value[productType] === activeCategory.value)
  );
});

const formatSaleTime = (saleTime) => {
  const options = { hour: "2-digit", minute: "2-digit", hour12: true };
  return new Date(saleTime).toLocaleTimeString(undefined, options);
};

const toggleCategory = (category) => {
  activeCategory.value = category;
};
</script>
```