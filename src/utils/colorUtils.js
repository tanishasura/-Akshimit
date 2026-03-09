export const getColorCode = (colorName) => {
  if (!colorName) return "transparent";
  const name = colorName.toLowerCase().trim();
  const colorMap = {
    "red": "#ef4444",
    "black": "#000000",
    "blue": "#1d4ed8",
    "purple": "#6b21a8",
    "grey": "#6b7280",
    "white": "#ffffff",
    "maroon": "#b91c1c",
    "khaki": "#C3B091",
    "dark brown": "#7f1d1d",
    "pink": "#f472b6",
    "sky blue": "#60a5fa",
    "orange": "#f97316",
    "yellow": "#facc15",
    "green": "#16a34a",
  };
  return colorMap[name] || name;
};
