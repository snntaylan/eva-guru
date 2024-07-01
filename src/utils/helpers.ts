
export const getUserInfo = () => {
  return localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
}
