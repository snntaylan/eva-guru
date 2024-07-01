<script setup lang="ts">
import { fetchRequest } from '@/services/api.service';
import { getUserInfo } from '@/utils/helpers';
import { onMounted, ref } from 'vue'
import { Chart } from 'highcharts-vue'
import moment from 'moment';
import { store } from '@/store';

let chartFilters = ref({
  day: 7
})
let chartDataArray = ref()

let chartOptions = ref({
    chart: {
        type: 'column',
        height: (6 / 16 * 100) + '%' // 16:6 ratio
    },
    title: {
        text: 'Daily Sales',
        align: 'left'
    },
    xAxis: {
      categories: [] 
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Amount ($)'
        },
        stackLabels: {
            enabled: true
        }
    },
    legend: {
        align: 'center',
        verticalAlign: 'bottom',
        backgroundColor: 'white',
        borderColor: '#CCC',
        borderWidth: 1,
        shadow: false
    },
    tooltip: {
        shared: true,
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: `{series.name}: {point.y}<br/>
                      Total: {point.stackTotal}`
    },
    plotOptions: {
        column: {
            events: {
              click: function (ev: any) {
                const categoryIndex = ev.point.index;
                console.log(ev)
                const selectedDate = chartDataArray.value[categoryIndex].date
                if (!store.state.column1Date) {
                  store.commit('updateColumn1Date', selectedDate);
                } else {
                  store.commit('updateColumn2Date', selectedDate);
                }
              }
            },
            stacking: 'normal',
            dataLabels: {
                enabled: true
            }
        }
    },
    series: []
})

function getCategoriesList(chartData: any[]) {
  return chartData.map(x => moment(x.date, 'YYYY-MM-DD').format('dddd, DD-MM-YYYY'))
}

function getProfitsList(chartData: any[]) {
  return chartData.map(x => x.profit)
}

function getFBAList(chartData: any[]) {
  return chartData.map(x => x.fbaAmount)
}

function getFBMList(chartData: any[]) {
  return chartData.map(x => x.fbmAmount)
}

function onChartFilterChanged(ev: KeyboardEvent) {
  // chartFilters.value.day = ev.currentTarget.value
  chartFilters.value.day = ev.currentTarget.value;
  store.commit("updateRequestedDays", ev.currentTarget.value);
  initChartData();
}

function initChartData() {
  loadChartData().then((chartData) => {
    if (chartData) {
      const dataArr = chartData.Data.item;
      const categories = getCategoriesList(dataArr);
      const profits = getProfitsList(dataArr);
      const fbaSales = getFBAList(dataArr);
      const fbmSales = getFBMList(dataArr);

      chartDataArray.value = dataArr;

      chartOptions.value.xAxis.categories = categories;
      chartOptions.value.series = [
        {
          name: 'Profit',
          data: profits
        }, {
          name: 'FBA Sales',
          data: fbaSales
        }, {
          name: 'FBM Sales',
          data: fbmSales
        }
      ];
    }
  })
}

onMounted(() => {
  initChartData()
})

async function loadChartData() {
  try {
    const userInfo = getUserInfo();
    const response = await fetchRequest('data/daily-sales-overview', {
      method: 'POST',
      body: {
        "marketplace": userInfo?.user?.store?.[0]?.marketplaceName,
        "sellerId": userInfo?.user?.store?.[0]?.storeId,
        "requestStatus": 0,
        "day": chartFilters.value.day,
        "excludeYoYData": true
      }
    });
    return response;
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>

  <select :value="chartFilters.day" @change="onChartFilterChanged">
    <option :value="60">Last 60 days</option>
    <option :value="30">Last 30 days</option>
    <option :value="14">Last 14 days</option>
    <option :value="7">Last 7 days</option>
  </select>

  <highcharts :options="chartOptions"></highcharts>
</template>: any: any: any: any
