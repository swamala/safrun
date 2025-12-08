/**
 * SAFRUN Shield Icon
 * Brand protection icon
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '@/theme/colors';

interface IconProps {
  size?: number;
  color?: string;
}

export function ShieldIcon({ size = 24, color = colors.navy[500] }: IconProps) {
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
 * Filled Shield Icon
 */
export function ShieldFilledIcon({ size = 24, color = colors.safrun[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L4 5V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V5L12 2Z"
        fill={color}
      />
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
 * Shield Check Icon - for verified/safe status
 */
export function ShieldCheckIcon({ size = 24, color = colors.safety[500] }: IconProps) {
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
        d="M9 12L11 14L15 10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default ShieldIcon;

