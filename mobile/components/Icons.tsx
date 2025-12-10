/**
 * SAFRUN Icons
 * Geometric icons matching the shield logo style
 */

import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { colors } from '@/theme/colors';

interface IconProps {
  size?: number;
  color?: string;
}

const defaultSize = 24;
const defaultColor = colors.navy[500];

/**
 * Shield Icon - SAFRUN brand icon
 */
export function ShieldIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L4 5V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V5L12 2Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 8V12M12 16H12.01"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Map Pin Icon
 */
export function MapPinIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="9" r="3" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

/**
 * Users Icon
 */
export function UsersIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={2} />
      <Path
        d="M23 21V19C23 17.14 21.87 15.57 20.24 15.13"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 3.13C17.64 3.56 18.77 5.13 18.77 7C18.77 8.87 17.64 10.44 16 10.87"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Bell/Alert Icon
 */
export function BellIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8C18 6.4 17.36 4.86 16.24 3.76C15.12 2.64 13.6 2 12 2C10.4 2 8.88 2.64 7.76 3.76C6.64 4.88 6 6.4 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21C13.55 21.3 13.3 21.55 13 21.73C12.7 21.91 12.36 22 12 22C11.64 22 11.3 21.91 11 21.73C10.7 21.55 10.45 21.3 10.27 21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Alert Triangle Icon
 */
export function AlertTriangleIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.64 1.55 19C1.56 19.36 1.66 19.69 1.84 19.99C2.02 20.29 2.27 20.54 2.58 20.71C2.88 20.89 3.22 20.98 3.58 20.98H20.52C20.88 20.99 21.22 20.9 21.53 20.72C21.83 20.55 22.08 20.3 22.26 20C22.44 19.7 22.54 19.36 22.54 19C22.54 18.65 22.45 18.31 22.28 18L13.81 3.86C13.63 3.56 13.38 3.32 13.08 3.15C12.78 2.98 12.44 2.89 12.1 2.89C11.76 2.89 11.42 2.98 11.12 3.15C10.82 3.32 10.57 3.57 10.39 3.86H10.29Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 9V13M12 17H12.01"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Home Icon
 */
export function HomeIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9L12 2L21 9V20C21 20.53 20.79 21.04 20.41 21.41C20.04 21.79 19.53 22 19 22H5C4.47 22 3.96 21.79 3.59 21.41C3.21 21.04 3 20.53 3 20V9Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 22V12H15V22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Settings/Gear Icon
 */
export function SettingsIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} />
      <Path
        d="M19.4 15C19.2 15.3 19.16 15.66 19.28 15.97L19.74 17.21C19.98 17.87 19.73 18.6 19.16 19.02L17.84 20.02C17.26 20.44 16.48 20.38 15.97 19.87L15.03 18.93C14.79 18.69 14.45 18.55 14.1 18.55C13.75 18.55 13.41 18.68 13.17 18.93L12.23 19.87C11.72 20.38 10.94 20.44 10.36 20.02L9.04 19.02C8.47 18.6 8.22 17.87 8.46 17.21L8.92 15.97C9.04 15.66 9 15.3 8.8 15C8.6 14.7 8.27 14.52 7.92 14.52H6.58C5.87 14.52 5.25 14.02 5.11 13.33L4.82 11.88C4.68 11.19 5.03 10.49 5.67 10.19L6.85 9.67C7.14 9.54 7.37 9.31 7.5 9.02C7.63 8.73 7.65 8.41 7.55 8.11L7.09 6.87C6.85 6.21 7.1 5.48 7.67 5.06L8.99 4.06C9.57 3.64 10.35 3.7 10.86 4.21L11.8 5.15C12.04 5.39 12.38 5.53 12.73 5.53C13.08 5.53 13.42 5.4 13.66 5.15L14.6 4.21C15.11 3.7 15.89 3.64 16.47 4.06L17.79 5.06C18.36 5.48 18.61 6.21 18.37 6.87L17.91 8.11C17.81 8.41 17.83 8.73 17.96 9.02C18.09 9.31 18.32 9.54 18.61 9.67L19.79 10.19C20.43 10.49 20.78 11.19 20.64 11.88L20.35 13.33C20.21 14.02 19.59 14.52 18.88 14.52H17.54C17.19 14.52 16.86 14.7 16.66 15H19.4Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Play Icon
 */
export function PlayIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 3L19 12L5 21V3Z"
        fill={color}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Arrow Right Icon
 */
export function ArrowRightIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12H19M19 12L12 5M19 12L12 19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Arrow Left Icon
 */
export function ArrowLeftIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M5 12L12 19M5 12L12 5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Sun Icon (Light mode)
 */
export function SunIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth={2} />
      <Path
        d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Moon Icon (Dark mode)
 */
export function MoonIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1582 17.4668C18.1125 18.8192 16.7035 19.8458 15.0957 20.4265C13.4879 21.0073 11.748 21.1181 10.0795 20.7461C8.41104 20.3741 6.88302 19.5345 5.67425 18.3258C4.46548 17.117 3.62596 15.589 3.25393 13.9205C2.8819 12.252 2.99274 10.5121 3.57348 8.9043C4.15423 7.29651 5.18085 5.88749 6.53324 4.84175C7.88562 3.79602 9.50782 3.15731 11.21 3C10.2134 4.34827 9.73387 6.00945 9.85856 7.68141C9.98324 9.35338 10.7039 10.9251 11.8894 12.1106C13.0749 13.2961 14.6466 14.0168 16.3186 14.1414C17.9906 14.2661 19.6517 13.7866 21 12.79Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Mail Icon
 */
export function MailIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 6L12 13L2 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Lock Icon
 */
export function LockIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth={2} />
      <Path
        d="M7 11V7C7 5.67 7.53 4.4 8.46 3.46C9.4 2.53 10.67 2 12 2C13.33 2 14.6 2.53 15.54 3.46C16.47 4.4 17 5.67 17 7V11"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Eye Icon
 */
export function EyeIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

/**
 * Eye Off Icon
 */
export function EyeOffIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.94 17.94C16.23 19.24 14.18 19.99 12 20C5 20 1 12 1 12C2.24 9.68 3.97 7.66 6.06 6.06M9.9 4.24C10.59 4.08 11.29 4 12 4C19 4 23 12 23 12C22.39 13.13 21.66 14.18 20.83 15.12M14.12 14.12C13.86 14.4 13.55 14.63 13.2 14.79C12.86 14.95 12.49 15.04 12.11 15.04C11.73 15.05 11.35 14.97 11.01 14.82C10.66 14.67 10.34 14.45 10.08 14.18C9.82 13.92 9.61 13.6 9.47 13.26C9.33 12.91 9.26 12.54 9.27 12.16C9.27 11.78 9.36 11.41 9.52 11.07C9.68 10.73 9.92 10.43 10.2 10.18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1 1L23 23"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * User Icon
 */
export function UserIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21V19C20 17.93 19.58 16.91 18.83 16.17C18.09 15.42 17.07 15 16 15H8C6.93 15 5.91 15.42 5.17 16.17C4.42 16.91 4 17.93 4 19V21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

/**
 * Check Icon
 */
export function CheckIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * X/Close Icon
 */
export function XIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6L18 18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Menu Icon
 */
export function MenuIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 12H21M3 6H21M3 18H21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Chevron Right Icon
 */
export function ChevronRightIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18L15 12L9 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Plus Icon
 */
export function PlusIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5V19M5 12H19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Crosshair/Target Icon
 */
export function CrosshairIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <Path
        d="M22 12H18M6 12H2M12 6V2M12 22V18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Layers Icon
 */
export function LayersIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2 17L12 22L22 17"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2 12L12 17L22 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Zoom In Icon
 */
export function ZoomInIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={2} />
      <Path
        d="M21 21L16.65 16.65M11 8V14M8 11H14"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Zoom Out Icon
 */
export function ZoomOutIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={2} />
      <Path
        d="M21 21L16.65 16.65M8 11H14"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Filter Icon
 */
export function FilterIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Chevron Up Icon
 */
export function ChevronUpIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 15L12 9L6 15"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Chevron Down Icon
 */
export function ChevronDownIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9L12 15L18 9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Navigation Icon
 */
export function NavigationIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 11L22 2L13 21L11 13L3 11Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Phone Icon
 */
export function PhoneIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 16.92V19.92C22 20.48 21.78 21.01 21.39 21.4C21 21.79 20.48 22 19.92 22C16.37 21.69 12.95 20.5 9.99 18.55C7.23 16.76 4.93 14.46 3.14 11.7C1.16 8.71 -0.02 5.26 0.28 1.69C0.3 1.14 0.52 0.62 0.91 0.24C1.3 -0.15 1.82 -0.36 2.37 -0.34H5.37C6.35 -0.35 7.18 0.36 7.35 1.33C7.51 2.51 7.82 3.67 8.26 4.77C8.53 5.44 8.38 6.2 7.88 6.72L6.59 8.01C8.23 10.93 10.65 13.35 13.57 14.99L14.86 13.7C15.38 13.2 16.14 13.05 16.81 13.32C17.91 13.76 19.07 14.07 20.25 14.23C21.24 14.41 21.96 15.27 21.94 16.27L22 16.92Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Clock Icon
 */
export function ClockIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <Path
        d="M12 6V12L16 14"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Search Icon
 */
export function SearchIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={2} />
      <Path
        d="M21 21L16.65 16.65"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Message/Chat Icon
 */
export function MessageIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15C21 15.53 20.79 16.04 20.41 16.41C20.04 16.79 19.53 17 19 17H7L3 21V5C3 4.47 3.21 3.96 3.59 3.59C3.96 3.21 4.47 3 5 3H19C19.53 3 20.04 3.21 20.41 3.59C20.79 3.96 21 4.47 21 5V15Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Send Icon
 */
export function SendIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Running/Footprints Icon
 */
export function FootprintsIcon({ size = defaultSize, color = defaultColor }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 16V17C4 17.53 4.21 18.04 4.59 18.41C4.96 18.79 5.47 19 6 19H7.5C8.03 19 8.54 18.79 8.91 18.41C9.29 18.04 9.5 17.53 9.5 17V16C9.5 15.47 9.29 14.96 8.91 14.59C8.54 14.21 8.03 14 7.5 14H6C5.47 14 4.96 14.21 4.59 14.59C4.21 14.96 4 15.47 4 16Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.5 16V17C14.5 17.53 14.71 18.04 15.09 18.41C15.46 18.79 15.97 19 16.5 19H18C18.53 19 19.04 18.79 19.41 18.41C19.79 18.04 20 17.53 20 17V16C20 15.47 19.79 14.96 19.41 14.59C19.04 14.21 18.53 14 18 14H16.5C15.97 14 15.46 14.21 15.09 14.59C14.71 14.96 14.5 15.47 14.5 16Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 6V8C4 8.53 4.21 9.04 4.59 9.41C4.96 9.79 5.47 10 6 10H7.5C8.03 10 8.54 9.79 8.91 9.41C9.29 9.04 9.5 8.53 9.5 8V6C9.5 5.47 9.29 4.96 8.91 4.59C8.54 4.21 8.03 4 7.5 4H6C5.47 4 4.96 4.21 4.59 4.59C4.21 4.96 4 5.47 4 6Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.5 6V8C14.5 8.53 14.71 9.04 15.09 9.41C15.46 9.79 15.97 10 16.5 10H18C18.53 10 19.04 9.79 19.41 9.41C19.79 9.04 20 8.53 20 8V6C20 5.47 19.79 4.96 19.41 4.59C19.04 4.21 18.53 4 18 4H16.5C15.97 4 15.46 4.21 15.09 4.59C14.71 4.96 14.5 5.47 14.5 6Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Flame Icon
export function FlameIcon({ size = 24, color = colors.safrun[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22C16 22 19 18.5 19 14C19 10.5 17 7 15 5C14.5 4.5 14 4 14 3C14 3 13.5 3.5 13 4C11 6 9 9 9 12C9 13.5 9 14 8 14.5C7 15 5 13.5 5 12C5 10.5 6 9 7 8C7 8 5 10 5 14C5 18.5 8 22 12 22Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Camera Icon
export function CameraIcon({ size = 24, color = colors.navy[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

// Check Circle Icon
export function CheckCircleIcon({ size = 24, color = colors.safety[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85782 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 4L12 14.01L9 11.01"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Edit Icon
export function EditIcon({ size = 24, color = colors.navy[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

