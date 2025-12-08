/**
 * SAFRUN Plus and Action Icons
 * Common action icons
 */

import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/theme/colors';

interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Plus Icon
 */
export function PlusIcon({ size = 24, color = colors.navy[500] }: IconProps) {
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
 * Minus Icon
 */
export function MinusIcon({ size = 24, color = colors.navy[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12H19"
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
export function XIcon({ size = 24, color = colors.navy[500] }: IconProps) {
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
 * Check Icon
 */
export function CheckIcon({ size = 24, color = colors.navy[500] }: IconProps) {
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
 * Check Circle Icon
 */
export function CheckCircleIcon({ size = 24, color = colors.safety[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
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

/**
 * Plus Circle Icon
 */
export function PlusCircleIcon({ size = 24, color = colors.navy[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <Path
        d="M12 8V16M8 12H16"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Menu Icon (Hamburger)
 */
export function MenuIcon({ size = 24, color = colors.navy[500] }: IconProps) {
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
 * More Vertical Icon (3 dots)
 */
export function MoreVerticalIcon({ size = 24, color = colors.navy[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="1" fill={color} />
      <Circle cx="12" cy="5" r="1" fill={color} />
      <Circle cx="12" cy="19" r="1" fill={color} />
    </Svg>
  );
}

/**
 * More Horizontal Icon (3 dots)
 */
export function MoreHorizontalIcon({ size = 24, color = colors.navy[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="1" fill={color} />
      <Circle cx="5" cy="12" r="1" fill={color} />
      <Circle cx="19" cy="12" r="1" fill={color} />
    </Svg>
  );
}

export default PlusIcon;

