const API_URL = 'http://api.stymconnect.com/auth/';

// Register user
const register = async (userData) => {
  console.log(userData, 'userdata from service');
  const response = await axios.post(`${API_URL}registration`, userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  // console.log(response.data);

  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(`${API_URL}login`, userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

const base64decode = (encodedData) => {
  const base64 = encodedData.token
    ? encodedData.token.split('.')[1]
    : encodedData.split('.')[1];
  const decoded = JSON.parse(atob(base64));
  // "{"user":"test@test.com","roles":["ROLE_USER"],"exp":1649931861}"
  // const res = {user:}
  return {
    email: decoded.user,
    roles: decoded.roles,
    exp: decoded.exp,
    tariff: decoded.tariff,
    access: decoded.access,
  };
};

const authService = {
  register,
  logout,
  login,
  base64decode,
};

export default authService;
