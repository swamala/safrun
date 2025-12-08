/**
 * SAFRUN SOS Icons
 * Emergency and alert icons
 */

import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '@/theme/colors';

interface IconProps {
  size?: number;
  color?: string;
}

/**
 * SOS Alert Icon - Primary emergency icon
 */
export function SOSIcon({ size = 24, color = colors.danger[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
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
 * Filled SOS Icon
 */
export function SOSFilledIcon({ size = 24, color = colors.danger[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Path
        d="M12 8V12M12 16H12.01"
        stroke="white"
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
export function AlertTriangleIcon({ size = 24, color = colors.warning[500] }: IconProps) {
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
 * Bell Alert Icon
 */
export function BellAlertIcon({ size = 24, color = colors.navy[500] }: IconProps) {
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
      <Circle cx="18" cy="4" r="3" fill={colors.danger[500]} />
    </Svg>
  );
}

/**
 * Phone Alert Icon - Emergency call
 */
export function PhoneAlertIcon({ size = 24, color = colors.danger[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 16.92V19.92C22 20.48 21.78 21.01 21.39 21.4C21 21.79 20.47 22.01 19.91 22.01C16.56 21.68 13.36 20.47 10.62 18.5C8.06 16.68 5.94 14.56 4.11 12C2.11 9.23 0.9 6 0.59 2.62C0.59 2.06 0.81 1.53 1.2 1.14C1.59 0.75 2.12 0.53 2.68 0.53H5.68C6.66 0.52 7.52 1.24 7.68 2.21C7.84 3.21 8.14 4.19 8.56 5.11C8.83 5.71 8.69 6.42 8.21 6.88L7 8.09C8.62 10.83 10.89 13.1 13.63 14.72L14.84 13.51C15.3 13.03 16.01 12.89 16.61 13.16C17.53 13.58 18.51 13.88 19.51 14.04C20.5 14.2 21.24 15.09 21.22 16.09L22 16.92Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 2V8M15 5H21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SOSIcon;

