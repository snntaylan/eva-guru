<script setup lang="ts">
import { fetchRequest } from '@/services/api.service';
import { getUserInfo } from '@/utils/helpers';
import { onMounted, ref } from 'vue'
import { Chart } from 'highcharts-vue'
import moment from 'moment';
import { store } from '@/store';
import type { ChartOptions } from 'highcharts';

const chartColors = {
  fbaSales: "rgb(109,104,222)",
  fbmSales: "rgb(25,251,139)",
  profit: "rgb(44,175,254)",
  selectedColumn1FBASales: 'cadetblue',
  selectedColumn2FBASales: 'green',
}

let chartFilters = ref({
  day: 7
})
let selectedIndexes = ref({
  column1Index: -1,
  column2Index: -1,
})
let chartDataArray = ref()

let chartOptionsDefault: ChartOptions = {
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
        pointFormat: `{series.name}: {point.y}<br/>`
    },
    plotOptions: {
        column: {
            events: {
              click: function (ev: any) {
                const categoryIndex = ev.point.index;
                console.log(ev)
                const selectedDate = chartDataArray.value[categoryIndex].date
                if (!store.state.column1Date) {
                  selectedIndexes.value.column1Index = categoryIndex;
                  store.commit('updateColumn1Date', selectedDate);
                  resetColors(ev.point.series.xAxis.series, 'column1');
                  selectSaleColumn(ev.point.series.xAxis.series, categoryIndex, chartColors.selectedColumn1FBASales)
                } else {
                  selectedIndexes.value.column2Index = categoryIndex;
                  store.commit('updateColumn2Date', selectedDate);
                  resetColors(ev.point.series.xAxis.series, 'column2');
                  selectSaleColumn(ev.point.series.xAxis.series, categoryIndex, chartColors.selectedColumn2FBASales)
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
}
let chartOptions = ref(chartOptionsDefault)

function resetColors(series: any[], scope: string) {
  const fbaSaleColumn: any = series.find(x => x['name'] == "FBA Sales");
  if (fbaSaleColumn) {
    fbaSaleColumn.data.forEach((element: any, index: number) => {
      if (scope == "column2" && index !== selectedIndexes.value.column1Index) {
        element.update({
          color: chartColors.fbaSales
        })
      }
    });
  }
}

function selectSaleColumn(series: any[], selectionIndex: number, color: string) {
  const fbaSaleColumn: any = series.find(x => x['name'] == "FBA Sales");
  if (fbaSaleColumn) {
    fbaSaleColumn.data[selectionIndex].update({
      color
    })
  }
}

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
  store.commit('updateColumn1Date', null);
  store.commit('updateColumn2Date', null);
  selectedIndexes.value = {
    column1Index: -1,
    column2Index: -1,
  }
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
          data: profits,
          color: chartColors.profit
        }, {
          name: 'FBA Sales',
          data: fbaSales,
          color: chartColors.fbaSales
        }, {
          name: 'FBM Sales',
          data: fbmSales,
          color: chartColors.fbmSales
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

  <div class="chart-wrapper p-4">
    <div class="flex justify-end">
      <select :value="chartFilters.day" @change="onChartFilterChanged">
        <option :value="60">Last 60 days</option>
        <option :value="30">Last 30 days</option>
        <option :value="14">Last 14 days</option>
        <option :value="7">Last 7 days</option>
      </select>
    </div>

    <highcharts :options="chartOptions"></highcharts>
  </div>
</template>
