
const BASE_URL = "https://iapitest.eva.guru";

export const fetchRequest = (endpoint: string, options: RequestInit) => {
  const url = `${BASE_URL}/${endpoint}`;

  if (!options.headers) {
    options.headers = {};
  }

  const token = localStorage.getItem('accessToken');
  if (token) options.headers['Authorization'] = `Bearer ${token}`;

  options.headers['Accept'] = 'application/json';
  options.headers['Content-Type'] = 'application/json';

  if (options?.method?.toUpperCase() == "POST") options.body = JSON.stringify(options.body);

  return fetch(url, options)
  .then(r => r.json())
  .catch((err) =>  {
    throw new Error(`Response status: ${err.status}`);
  })
}
