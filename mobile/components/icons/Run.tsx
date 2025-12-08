/**
 * SAFRUN Run Icons
 * Activity and fitness icons
 */

import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/theme/colors';

interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Running Person Icon
 */
export function RunIcon({ size = 24, color = colors.navy[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="17" cy="4" r="2" stroke={color} strokeWidth={2} />
      <Path
        d="M15.59 13.51L12 10L8 6L4 10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 17L10 21L6 17L8 13"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 14L20 18L22 14"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Footprints Icon
 */
export function FootprintsIcon({ size = 24, color = colors.navy[500] }: IconProps) {
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

/**
 * Play Icon - Start run
 */
export function PlayIcon({ size = 24, color = colors.navy[500] }: IconProps) {
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
 * Pause Icon
 */
export function PauseIcon({ size = 24, color = colors.navy[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 4H10V20H6V4Z"
        fill={color}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 4H18V20H14V4Z"
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
 * Stop Icon
 */
export function StopIcon({ size = 24, color = colors.navy[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4Z"
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
 * Flame Icon - Calories/intensity
 */
export function FlameIcon({ size = 24, color = colors.safrun[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.5 14.5C8.5 16.433 10.067 18 12 18C13.933 18 15.5 16.433 15.5 14.5C15.5 12.5 14 11 12 9C10 11 8.5 12.5 8.5 14.5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 2C12 2 6 8 6 14C6 17.314 8.686 20 12 20C15.314 20 18 17.314 18 14C18 8 12 2 12 2Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Timer Icon
 */
export function TimerIcon({ size = 24, color = colors.navy[500] }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="14" r="8" stroke={color} strokeWidth={2} />
      <Path
        d="M12 10V14L14 16"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 2H15"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 2V4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default RunIcon;

