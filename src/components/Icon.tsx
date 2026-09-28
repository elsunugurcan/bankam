import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useTheme } from "@/theme";

const PATHS: Record<string, string[]> = {
  home: ["M3 11 12 3l9 8", "M5 10v10h14V10", "M10 20v-6h4v6"],
  card: ["M2 10h20"],
  send: ["M22 2 11 13", "M22 2 15 22 11 13 2 9z"],
  chart: ["M5 20v-6", "M11 20V8", "M17 20v-10", "M3 20h18"],
  menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
  plus: ["M12 5v14", "M5 12h14"],
  minus: ["M5 12h14"],
  x: ["M6 6l12 12", "M18 6L6 18"],
  check: ["M5 12l5 5L20 7"],
  left: ["M15 6l-6 6 6 6"],
  right: ["M9 6l6 6-6 6"],
  down: ["M6 9l6 6 6-6"],
  arrow: ["M5 12h14", "M13 6l6 6-6 6"],
  arrowUp: ["M12 19V5", "M6 11l6-6 6 6"],
  arrowDown: ["M12 5v14", "M6 13l6 6 6-6"],
  swap: ["M7 4v16", "M3 8l4-4 4 4", "M17 20V4", "M13 16l4 4 4-4"],
  eye: ["M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"],
  eyeOff: ["M3 3l18 18", "M10.5 6.2A10 10 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.2 3.7", "M6.6 6.6A16 16 0 0 0 2 12s4 6 10 6a9.7 9.7 0 0 0 3.4-.6"],
  lock: ["M7 11V8a5 5 0 0 1 10 0v3"],
  bell: ["M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9", "M10 21a2 2 0 0 0 4 0"],
  search: ["M21 21l-4.3-4.3"],
  star: ["M12 2l3 6.5 7 .8-5.2 4.8 1.5 7-6.3-3.6L5.7 21l1.5-7L2 9.3l7-.8z"],
  snow: ["M12 2v20", "M2 12h20", "M5 5l14 14", "M19 5 5 19"],
  wifi: ["M5 12.5a10 10 0 0 1 14 0", "M8.5 16a5 5 0 0 1 7 0", "M2 9a14 14 0 0 1 20 0"],
  globe: ["M2 12h20", "M12 2a15 15 0 0 1 0 20", "M12 2a15 15 0 0 0 0 20"],
  shield: ["M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"],
  sun: ["M12 4V2", "M12 22v-2", "M4 12H2", "M22 12h-2", "M5.6 5.6 4.2 4.2", "M19.8 19.8l-1.4-1.4", "M5.6 18.4l-1.4 1.4", "M19.8 4.2l-1.4 1.4"],
  moon: ["M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"],
  type: ["M4 7V4h16v3", "M12 4v16", "M9 20h6"],
  user: ["M4 21a8 8 0 0 1 16 0"],
  users: ["M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2", "M21 21v-2a4 4 0 0 0-3-3.9"],
  cart: ["M3 3h2l2.5 12h11L21 7H6"],
  food: ["M6 3v5a2.5 2.5 0 0 0 5 0V3", "M8.5 10.5V21", "M17 3v18", "M17 3c3 3 3 9 0 10"],
  bus: ["M5 17h14", "M5 6h14v13H5z", "M7 19v2", "M17 19v2", "M5 11h14"],
  bolt: ["M13 2 4 14h7l-1 8 9-12h-7z"],
  film: ["M4 4h16v16H4z", "M4 9h16", "M4 15h16", "M9 4v16", "M15 4v16"],
  heart: ["M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z"],
  shirt: ["M8 3 12 5l4-2 4 4-3 2v11H7V9L4 7z"],
  wallet: ["M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z", "M3 7V5a2 2 0 0 1 2-2h11v4", "M16 13h4"],
  briefcase: ["M3 8h18v12H3z", "M8 8V5h8v3", "M3 13h18"],
  dots: ["M6 12h.01", "M12 12h.01", "M18 12h.01"],
  info: ["M12 8h.01", "M12 12v4"],
  palette: ["M12 3a9 9 0 0 0 0 18h1a2 2 0 0 0 1-3.7 2 2 0 0 1 1.4-3.3H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3z"],
  grid: ["M4 4h6v6H4z", "M14 4h6v6h-6z", "M4 14h6v6H4z", "M14 14h6v6h-6z"],
  refresh: ["M21 12a9 9 0 1 1-2.6-6.4", "M21 3v6h-6"],
  target: [],
  qr: ["M4 4h6v6H4z", "M14 4h6v6h-6z", "M4 14h6v6H4z", "M14 14h3v3", "M20 14v6h-3"],
  copy: ["M9 9h11v11H9z", "M5 15H4V4h11v1"],
  logout: ["M10 17l5-5-5-5", "M15 12H3", "M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"],
  finger: ["M12 11v5", "M8.5 9.5a4 4 0 0 1 7 0v4", "M5.5 8a7 7 0 0 1 13 0v6", "M12 14v6"],
  phone: ["M7 2h10v20H7z", "M11 18h2"],
  clock: ["M12 7v5l3 2"],
  trending: ["M3 17l6-6 4 4 8-8", "M14 7h7v7"],
  edit: ["M4 20h4l10-10-4-4L4 16z", "M13 7l4 4"],
};
export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 22, color, stroke = 2 }: { name: IconName; size?: number; color?: string; stroke?: number }) {
  const { c } = useTheme(); const col = color ?? c.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === "card" && <Rect x={2} y={5} width={20} height={14} rx={3} stroke={col} strokeWidth={stroke} />}
      {name === "lock" && <Rect x={4} y={11} width={16} height={10} rx={2} stroke={col} strokeWidth={stroke} />}
      {(name === "search" || name === "eye" || name === "user" || name === "info" || name === "clock" || name === "globe") && <Circle cx={name === "search" ? 11 : name === "user" ? 12 : 12} cy={name === "search" ? 11 : name === "user" ? 8 : 12} r={name === "search" ? 7 : name === "eye" ? 3 : name === "user" ? 4 : name === "info" || name === "clock" || name === "globe" ? 9 : 3} stroke={col} strokeWidth={stroke} />}
      {name === "users" && <><Circle cx={10} cy={7} r={4} stroke={col} strokeWidth={stroke} /><Path d="M16 3.1a4 4 0 0 1 0 7.8" stroke={col} strokeWidth={stroke} strokeLinecap="round" /></>}
      {name === "target" && <><Circle cx={12} cy={12} r={9} stroke={col} strokeWidth={stroke} /><Circle cx={12} cy={12} r={5} stroke={col} strokeWidth={stroke} /><Circle cx={12} cy={12} r={1.5} fill={col} /></>}
      {name === "cart" && <><Circle cx={9} cy={20} r={1.2} fill={col} /><Circle cx={17} cy={20} r={1.2} fill={col} /></>}
      {name === "bus" && <><Circle cx={8} cy={15} r={1} fill={col} /><Circle cx={16} cy={15} r={1} fill={col} /></>}
      {name === "sun" && <Circle cx={12} cy={12} r={4} stroke={col} strokeWidth={stroke} />}
      {name === "palette" && <><Circle cx={8} cy={10} r={1.2} fill={col} /><Circle cx={12} cy={7} r={1.2} fill={col} /><Circle cx={16} cy={10} r={1.2} fill={col} /></>}
      {PATHS[name].map((d, i) => <Path key={i} d={d} stroke={col} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" fill={name === "star" ? col : "none"} />)}
    </Svg>
  );
}
