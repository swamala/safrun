/**
 * SAFRUN Mobile Components
 * Centralized export for all UI components and icons
 */

// ============================================
// UI Components
// ============================================
export { Button } from './Button';
export { IconButton } from './ui/IconButton';
export { Input, PasswordInput, SearchInput } from './Input';
export { Card, CardHeader, CardTitle, CardContent, CardFooter, StatCard } from './Card';
export { Badge, StatusBadge } from './Badge';
export { Header, LogoHeader } from './Header';
export { Pill, PillGroup } from './ui/Pill';
export { Switch } from './ui/Switch';
export { Modal, ModalFooter } from './ui/Modal';
export { ListItem, ListItemGroup } from './ui/ListItem';
export { Tabs } from './ui/Tabs';
export { Divider, SectionDivider } from './ui/Divider';
export { Avatar, AvatarGroup } from './ui/Avatar';
export { FloatingAction } from './ui/FloatingAction';
export { MapCard, MapCardCompact } from './ui/MapCard';
export { RunnerPill, SOSRunnerPill, RunnerPillList } from './ui/RunnerPill';

// ============================================
// Layout Components
// ============================================
export { Screen } from './layout/Screen';

// ============================================
// Icons - Individual Icon Files
// ============================================

// Shield Icons
export {
  ShieldIcon,
  ShieldFilledIcon,
  ShieldCheckIcon,
} from './icons/Shield';

// Location Icons
export {
  MapPinIcon,
  MapPinFilledIcon,
  NavigationIcon,
  CompassIcon,
  RouteIcon,
} from './icons/Location';

// SOS/Alert Icons
export {
  SOSIcon,
  SOSFilledIcon,
  AlertTriangleIcon,
  BellAlertIcon,
  PhoneAlertIcon,
} from './icons/SOS';

// Run/Activity Icons
export {
  RunIcon,
  FootprintsIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  FlameIcon,
  TimerIcon,
} from './icons/Run';

// Chevron/Arrow Icons
export {
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from './icons/ChevronRight';

// Plus/Action Icons
export {
  PlusIcon,
  MinusIcon,
  XIcon,
  CheckIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  MenuIcon,
  MoreVerticalIcon,
  MoreHorizontalIcon,
} from './icons/Plus';

// Common Icons
export {
  HomeIcon,
  HomeFilledIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  SearchIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  HeartIcon,
  ShareIcon,
} from './icons/Common';

// Additional Icons from main Icons.tsx
export {
  CrosshairIcon,
  LayersIcon,
  ZoomInIcon,
  ZoomOutIcon,
  FilterIcon,
  ClockIcon,
  MessageIcon,
  SendIcon,
  PhoneIcon,
} from './Icons';

// ============================================
// Map Components
// ============================================
export {
  SafrunMap,
  RunnerMarker,
  RoutePolyline,
  LiveSessionMap,
  NearbyRunnersMap,
  ResponderMap,
} from './map';

// ============================================
// Chat Components
// ============================================
export {
  ChatView,
  MessageBubble,
  ChatInput,
} from './chat';
