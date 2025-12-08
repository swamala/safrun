/**
 * SAFRUN Location Icons
 * Map and navigation icons
 */

import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/theme/colors';

interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Map Pin Icon - Location marker
 */
export function MapPinIcon({ size = 24, color = colors.navy[500] }: IconProps) {
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
 * Filled Map Pin Icon
 */
export function MapPinFilledIcon({ size = 24, color = colors.safrun[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
        fill={color}
      />
      <Circle cx="12" cy="9" r="3" fill="white" />
    </Svg>
  );
}

/**
 * Navigation Icon - Current location / compass
 */
export function NavigationIcon({ size = 24, color = colors.navy[500] }: IconProps) {
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
 * Compass Icon
 */
export function CompassIcon({ size = 24, color = colors.navy[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
      <Path
        d="M16.24 7.76L14.12 14.12L7.76 16.24L9.88 9.88L16.24 7.76Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Route Icon
 */
export function RouteIcon({ size = 24, color = colors.navy[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="6" cy="19" r="3" stroke={color} strokeWidth={2} />
      <Path
        d="M9 19H14C16.2091 19 18 17.2091 18 15C18 12.7909 16.2091 11 14 11H10C7.79086 11 6 9.20914 6 7C6 4.79086 7.79086 3 10 3H15"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="18" cy="5" r="3" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

export default MapPinIcon;

