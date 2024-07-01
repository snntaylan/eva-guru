import { createStore } from 'vuex'

export const store = createStore({
  state () {
    return {
      column1Date: "",
      column2Date: "",
      requestedDays: 7,
    }
  },
  mutations: {
    updateColumn1Date (state: { column1Date: string }, column1Date: string) {
      state.column1Date = column1Date;
    },
    updateColumn2Date (state: { column2Date: string }, column2Date: string) {
      state.column2Date = column2Date;
    },
    updateRequestedDays (state: { requestedDays: string }, requestedDays: string) {
      state.requestedDays = requestedDays;
    }
  }
})