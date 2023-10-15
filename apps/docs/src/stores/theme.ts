export const getTheme = () => {
  return localStorage.getItem("theme");
};

export const setTheme = (theme: string) => {
  localStorage.setItem("theme", theme);
};
