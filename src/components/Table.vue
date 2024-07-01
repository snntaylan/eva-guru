<script>
import { fetchRequest } from '@/services/api.service';
import { store } from '@/store';
import { getUserInfo } from '@/utils/helpers';
import moment from 'moment';
import { defineComponent } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  setup() {
    const store = useStore();
    let skus = [];
    let refunds = [];

    return {
      store,
      skus,
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
            "skuList": this.skus.map(x => x.sku),
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
    consoleLog(data) {
      console.log(data, "DATA from fromtend")
    },
    fetchColumnData() {
      
      if (!store.state.column1Date) return true;
        
      this.getSKUData().then(async (skuData) => {
        
        console.log(skuData)
        this.skus = [...skuData.Data.item.skuList];

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
  <table v-if="store.state.column1Date">
    <thead>
      <tr>
        <th>SKU</th>
        <th>Product Name</th>
        <th>
          {{formatDate(store.state.column1Date, 'dddd')}} <br />
          {{  formatDate(store.state.column1Date, 'DD-MM-YYYY')  }} <br />
          Sales / Units <br />
          Avg. Selling Price
        </th>
        <th>
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
      <tr v-for="(item, index) in skus">
        {{ consoleLog(item) }}
        <td>{{item.sku}}</td>
        <td>{{item.productName}}</td>
        <td>
          {{ item.amount }} / {{ item.qty }} <br />
          {{ (item.amount / item.qty).toFixed(2) || "0" }}
        </td>
        <td>
          {{ item.amount2 }} / {{ item.qty2 }} <br />
          {{ (item.amount2 / item.qty2).toFixed(2) || "0" }}
        </td>
        <td>
          {{ refunds[index].refundRate }}%
        </td>
      </tr>
    </tbody>
  </table>
</template>