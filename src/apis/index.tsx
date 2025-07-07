const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const connectJira = () => {
  window.location.href = `${API_BASE_URL}/jira-connect`;
};
