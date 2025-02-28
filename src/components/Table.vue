<script lang="ts">
import { fetchRequest } from '@/services/api.service';
import { store } from '@/store';
import { getUserInfo } from '@/utils/helpers';
import moment from 'moment';
import { defineComponent } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  setup() {
    const store = useStore();
    let allSKUs = [];
    let visibleSKUs = [];
    let refunds = [];
    const pageSize = 10;

    return {
      store,
      visibleSKUs,
      allSKUs,
      pageSize,
      refunds
    }
  },
  methods: {
    async getSKUData() {
      try {
        const userInfo = getUserInfo();
        const response = await fetchRequest('data/daily-sales-sku-list', {
          method: 'POST',
          body: {
            "marketplace": userInfo?.user?.store?.[0]?.marketplaceName,
            "sellerId": userInfo?.user?.store?.[0]?.storeId,
            "salesDate": store.state.column1Date,
            "salesDate2": store.state.column2Date,
            "pageSize": 30,
            "pageNumber": 1,
            "isDaysCompare": (store.state.column1Date && store.state.column2Date ? 1 : 0) // true | false
          }
        });
        return response;
      } catch (error) {
        console.error(error);
      }
    },
    async getSKURefundData() {
      try {
        const userInfo = getUserInfo();
        const response = await fetchRequest('data/get-sku-refund-rate', {
          method: 'POST',
          body: {
            "marketplace": userInfo?.user?.store?.[0]?.marketplaceName,
            "sellerId": userInfo?.user?.store?.[0]?.storeId,
            "skuList": this.allSKUs.map(x => x.sku),
            "requestedDay": store.state.requestedDays
          }
        });
        return response;
      } catch (error) {
        console.error(error);
      }
    },
    formatDate(date, format) {
      return moment(date).format(format);
    },
    getRefundRate(sku) {
      return this.refunds.find(x => x.sku === sku)?.refundRate;
    },
    changePage(pageNumber) {
      const startIndex = (pageNumber - 1) * 10;
      const endIndex = (pageNumber) * 10;
      this.visibleSKUs = [...this.allSKUs.slice(startIndex, endIndex)];
      this.$forceUpdate();
    },
    getPagesList() {
      let pages = [];
      let maxPages = Math.ceil(this.allSKUs.length / this.pageSize);
      for (let index = 0; index < maxPages; index++) {
        pages.push(index+1)
      }
      return pages;
    },
    consoleLog(data) {
      console.log(data, "DATA from fromtend")
    },
    fetchColumnData() {
      
      if (!store.state.column1Date) return true;
        
      this.getSKUData().then(async (skuData) => {
        const a = [];
        this.visibleSKUs = skuData.Data.item.skuList.slice(0, 10);
        this.allSKUs = [...skuData.Data.item.skuList];

        this.getSKURefundData().then((refundData) => {
          this.refunds = [...refundData.Data]
          
          this.$forceUpdate();
        });

      });

    }
  },
  watch: {
    '$store.state.column1Date': {
      handler() {
        this.fetchColumnData()
      },
      immediate: true,
    },
    '$store.state.column2Date': {
      handler() {
        this.fetchColumnData()
      },
      immediate: true,
    }
  }
})
</script>

<template>
  <div class="table-wrapper p-4">
    <table v-if="store.state.column1Date">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Product Name</th>
          <th style="color: cadetblue">
            {{formatDate(store.state.column1Date, 'dddd')}} <br />
            {{  formatDate(store.state.column1Date, 'DD-MM-YYYY')  }} <br />
            Sales / Units <br />
            Avg. Selling Price
          </th>
          <th style="color: green">
            {{formatDate(store.state.column2Date, 'dddd')}} <br />
            {{ formatDate(store.state.column2Date, 'DD-MM-YYYY') }} <br />
            Sales / Units <br />
            Avg. Selling Price
          </th>
          <th>
            SKU Refund Rate
            (Last 60 days)
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in visibleSKUs">
          <td>{{item.sku}}</td>
          <td>{{item.productName}}</td>
          <td>
            {{ item.amount }} / {{ item.qty }} <br />
            {{ (item.amount / item.qty) ? (item.amount / item.qty).toFixed(2) : "0" }}
          </td>
          <td>
            {{ item.amount2 }} / {{ item.qty2 }} <br />
            {{ (item.amount2 / item.qty2) ? (item.amount2 / item.qty2).toFixed(2) : "0" }}
          </td>
          <td>
            {{ getRefundRate(item.sku) }}%
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5">
            <ul class="flex gap-3">
              <li v-for="item in getPagesList()">
                <button class="flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" @click="() => changePage(item)">{{ item }}</button>
              </li>
            </ul>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>