#!/usr/bin/env npx ts-node

/**
 * SAFRUN SDK Verification Script
 * 
 * This script verifies that all stores and hooks in the monorepo
 * correctly use the @safrun/sdk package instead of legacy API clients.
 * 
 * Usage: npx ts-node scripts/verify-sdk.ts
 * 
 * Exit codes:
 *   0 - All checks passed
 *   1 - Some files need attention
 */

import * as fs from 'fs';
import * as path from 'path';
import { Project, SourceFile, SyntaxKind, Node } from 'ts-morph';

// =============================================================================
// Configuration
// =============================================================================

const ROOT_DIR = path.resolve(__dirname, '..');

// Directories to scan
const SCAN_DIRECTORIES = [
  'frontend/src/stores',
  'frontend/src/hooks',
  'mobile/lib/store',
  'mobile/hooks',
];

// Additional files to check (utilities that should use SDK)
const UTILITY_FILES = [
  'frontend/src/lib/utils.ts',
  'mobile/utils/formatters.ts',
];

// SDK package name
const SDK_PACKAGE = '@safrun/sdk';

// Types that should be imported from SDK
const SDK_TYPES = [
  'AuthUser',
  'AuthResponse',
  'SOSAlert',
  'SOSResponder',
  'Session',
  'SessionParticipant',
  'LocationUpdate',
  'NearbyRunner',
  'Notification',
  'FeedPost',
  'UserStats',
  // WebSocket event types
  'WSLocationBroadcast',
  'WSSOSAlert',
  'WSSOSUpdate',
  'WSSOSVerify',
  'WSSOSPreciseLocation',
  'WSNearbyUpdate',
  'WSSessionUpdate',
  'WSSessionParticipantEvent',
  'WSGuardianAlert',
  // Enums
  'SOSStatus',
  'SOSTriggerType',
  'RunnerStatus',
  'SessionStatus',
  'ResponderStatus',
  'DeviceType',
  'NotificationType',
];

// Formatters that should come from SDK
const SDK_FORMATTERS = [
  'formatDistance',
  'formatDuration',
  'formatDurationVerbose',
  'formatPace',
  'formatPacePerKm',
  'formatRelativeTime',
  'formatCoordinates',
  'getInitials',
  'generateAvatarUrl',
  'calculateDistance',
];

// Legacy patterns to detect
const LEGACY_PATTERNS = {
  // Direct axios usage
  axiosCalls: /axios\.(get|post|put|patch|delete)\s*\(/,
  // Direct fetch calls to API
  fetchCalls: /fetch\s*\(\s*['"`]\/api/,
  // Legacy API imports
  legacyApiImport: /from\s+['"`].*\/api['"`]/,
  // Direct socket.io usage (not via SDK)
  directSocketIo: /import\s+.*\s+from\s+['"`]socket\.io-client['"`]/,
};

// =============================================================================
// Types
// =============================================================================

interface FileCheckResult {
  filePath: string;
  sdkUsage: CheckStatus;
  types: CheckStatus;
  formatters: CheckStatus;
  issues: string[];
}

interface CheckStatus {
  passed: boolean;
  details: string[];
}

interface Summary {
  totalFiles: number;
  passedAll: number;
  needsAttention: number;
  results: FileCheckResult[];
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Recursively get all TypeScript files in a directory
 */
function getTypeScriptFiles(dir: string): string[] {
  const fullPath = path.join(ROOT_DIR, dir);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  Directory not found: ${dir}`);
    return [];
  }

  const files: string[] = [];
  
  function walk(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and dist
        if (entry.name !== 'node_modules' && entry.name !== 'dist') {
          walk(entryPath);
        }
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        files.push(entryPath);
      }
    }
  }
  
  walk(fullPath);
  return files;
}

/**
 * Check if a file imports from the SDK
 */
function checkSdkImports(sourceFile: SourceFile): { hasImport: boolean; importedItems: string[] } {
  const importDeclarations = sourceFile.getImportDeclarations();
  const importedItems: string[] = [];
  let hasImport = false;

  for (const importDecl of importDeclarations) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    
    if (moduleSpecifier === SDK_PACKAGE) {
      hasImport = true;
      
      // Get named imports
      const namedImports = importDecl.getNamedImports();
      for (const namedImport of namedImports) {
        importedItems.push(namedImport.getName());
      }
      
      // Get default import
      const defaultImport = importDecl.getDefaultImport();
      if (defaultImport) {
        importedItems.push(defaultImport.getText());
      }
    }
  }

  return { hasImport, importedItems };
}

/**
 * Check for legacy API patterns in a file
 */
function checkLegacyPatterns(sourceFile: SourceFile): string[] {
  const issues: string[] = [];
  const fileText = sourceFile.getFullText();
  const filePath = sourceFile.getFilePath();

  // Check for direct axios calls
  if (LEGACY_PATTERNS.axiosCalls.test(fileText)) {
    // Allow in sdk.ts files (backwards compat wrappers)
    if (!filePath.includes('sdk.ts') && !filePath.includes('api.ts')) {
      issues.push('Direct axios calls detected - should use SDK methods');
    }
  }

  // Check for direct fetch calls to API
  if (LEGACY_PATTERNS.fetchCalls.test(fileText)) {
    issues.push('Direct fetch calls to /api detected - should use SDK methods');
  }

  // Check for direct socket.io imports (not via SDK)
  const importDeclarations = sourceFile.getImportDeclarations();
  for (const importDecl of importDeclarations) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    if (moduleSpecifier === 'socket.io-client') {
      // Allow in SDK socket implementation
      if (!filePath.includes('packages/sdk')) {
        issues.push('Direct socket.io-client import - should use sdk.socket');
      }
    }
  }

  return issues;
}

/**
 * Check if SDK types are properly imported
 */
function checkTypeImports(sourceFile: SourceFile): CheckStatus {
  const issues: string[] = [];
  const details: string[] = [];
  const fileText = sourceFile.getFullText();
  const filePath = sourceFile.getFilePath();

  // Get all imports
  const importDeclarations = sourceFile.getImportDeclarations();
  const sdkImports = new Set<string>();
  const otherTypeImports = new Map<string, string>(); // type -> source

  for (const importDecl of importDeclarations) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    const namedImports = importDecl.getNamedImports();

    for (const namedImport of namedImports) {
      const importName = namedImport.getName();
      
      if (moduleSpecifier === SDK_PACKAGE) {
        sdkImports.add(importName);
      } else if (SDK_TYPES.includes(importName)) {
        // Found SDK type imported from elsewhere
        otherTypeImports.set(importName, moduleSpecifier);
      }
    }
  }

  // Check for SDK types imported from wrong sources
  for (const [typeName, source] of otherTypeImports) {
    if (!source.includes('sdk')) {
      issues.push(`Type '${typeName}' imported from '${source}' - should import from @safrun/sdk`);
    }
  }

  // Check if file uses SDK types that should be imported
  for (const typeName of SDK_TYPES) {
    // Use regex to find type usage (not perfect but reasonable)
    const typeUsageRegex = new RegExp(`:\\s*${typeName}[\\s\\[\\]|<>,)]|<${typeName}[\\s,>]`, 'g');
    if (typeUsageRegex.test(fileText)) {
      if (!sdkImports.has(typeName) && !otherTypeImports.has(typeName)) {
        // Type is used but not imported - might be inline or from another source
        // This is informational, not an error
        details.push(`Uses '${typeName}' - verify it's properly typed`);
      }
    }
  }

  if (sdkImports.size > 0) {
    details.push(`SDK types imported: ${Array.from(sdkImports).join(', ')}`);
  }

  return {
    passed: issues.length === 0,
    details: issues.length > 0 ? issues : details,
  };
}

/**
 * Check for duplicate formatter definitions
 */
function checkFormatters(sourceFile: SourceFile): CheckStatus {
  const issues: string[] = [];
  const details: string[] = [];
  const filePath = sourceFile.getFilePath();
  const fileText = sourceFile.getFullText();

  // Get imports
  const importDeclarations = sourceFile.getImportDeclarations();
  const sdkFormatterImports = new Set<string>();
  const otherFormatterImports = new Map<string, string>();

  for (const importDecl of importDeclarations) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    const namedImports = importDecl.getNamedImports();

    for (const namedImport of namedImports) {
      const importName = namedImport.getName();
      
      if (SDK_FORMATTERS.includes(importName)) {
        if (moduleSpecifier === SDK_PACKAGE) {
          sdkFormatterImports.add(importName);
        } else {
          otherFormatterImports.set(importName, moduleSpecifier);
        }
      }
    }
  }

  // Check for formatters imported from non-SDK sources
  for (const [formatterName, source] of otherFormatterImports) {
    // Allow re-exports from SDK
    if (!source.includes('sdk') && !source.includes('utils')) {
      issues.push(`'${formatterName}' imported from '${source}' - should use @safrun/sdk`);
    }
  }

  // Check for local formatter function definitions (duplicates)
  const functionDeclarations = sourceFile.getFunctions();
  for (const func of functionDeclarations) {
    const funcName = func.getName();
    if (funcName && SDK_FORMATTERS.includes(funcName)) {
      // Allow in SDK helpers file itself
      if (!filePath.includes('packages/sdk')) {
        // Check if it's just a re-export
        const body = func.getBody()?.getText() || '';
        if (body.length > 50) {
          // Has substantial implementation - likely duplicate
          issues.push(`Local definition of '${funcName}' found - should import from @safrun/sdk`);
        }
      }
    }
  }

  // Check for arrow function formatters
  const variableDeclarations = sourceFile.getVariableDeclarations();
  for (const varDecl of variableDeclarations) {
    const varName = varDecl.getName();
    if (SDK_FORMATTERS.includes(varName)) {
      const initializer = varDecl.getInitializer();
      if (initializer && Node.isArrowFunction(initializer)) {
        if (!filePath.includes('packages/sdk')) {
          issues.push(`Local arrow function '${varName}' found - should import from @safrun/sdk`);
        }
      }
    }
  }

  if (sdkFormatterImports.size > 0) {
    details.push(`SDK formatters used: ${Array.from(sdkFormatterImports).join(', ')}`);
  }

  return {
    passed: issues.length === 0,
    details: issues.length > 0 ? issues : details,
  };
}

/**
 * Check SDK usage in a file (REST API calls via SDK)
 */
function checkSdkUsage(sourceFile: SourceFile): CheckStatus {
  const issues: string[] = [];
  const details: string[] = [];
  const filePath = sourceFile.getFilePath();
  const fileText = sourceFile.getFullText();

  // Check if file imports SDK
  const { hasImport, importedItems } = checkSdkImports(sourceFile);

  // Check for legacy patterns
  const legacyIssues = checkLegacyPatterns(sourceFile);
  issues.push(...legacyIssues);

  // Check for SDK usage patterns
  const sdkUsagePatterns = [
    /sdk\.auth\./,
    /sdk\.profile\./,
    /sdk\.location\./,
    /sdk\.sessions\./,
    /sdk\.sos\./,
    /sdk\.stats\./,
    /sdk\.feed\./,
    /sdk\.notifications\./,
    /sdk\.nearby\./,
    /sdk\.socket\./,
    /sdk\.connectSocket/,
    /sdk\.disconnectSocket/,
  ];

  const usedSdkModules: string[] = [];
  for (const pattern of sdkUsagePatterns) {
    if (pattern.test(fileText)) {
      const match = pattern.source.match(/sdk\.(\w+)/);
      if (match) {
        usedSdkModules.push(match[1]);
      }
    }
  }

  // For store/hook files, we expect SDK usage
  const isStoreOrHook = filePath.includes('store') || filePath.includes('hooks');
  
  if (isStoreOrHook) {
    if (!hasImport && usedSdkModules.length === 0) {
      // Check if file has any API-like calls
      if (/await\s+\w+\.(get|post|put|patch|delete)\s*\(/.test(fileText)) {
        issues.push('File makes API calls but does not import SDK');
      }
    }
  }

  if (usedSdkModules.length > 0) {
    details.push(`SDK modules used: ${[...new Set(usedSdkModules)].join(', ')}`);
  }

  if (hasImport) {
    details.push('Imports from @safrun/sdk ✓');
  }

  return {
    passed: issues.length === 0,
    details: issues.length > 0 ? issues : details,
  };
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath: string, project: Project): FileCheckResult {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const sourceFile = project.addSourceFileAtPath(filePath);
  
  const sdkUsage = checkSdkUsage(sourceFile);
  const types = checkTypeImports(sourceFile);
  const formatters = checkFormatters(sourceFile);
  
  const allIssues = [
    ...sdkUsage.details.filter(d => !d.includes('✓') && !d.startsWith('SDK')),
    ...types.details.filter(d => d.includes('should')),
    ...formatters.details.filter(d => d.includes('should')),
  ];

  return {
    filePath: relativePath,
    sdkUsage,
    types,
    formatters,
    issues: allIssues,
  };
}

// =============================================================================
// Output Formatting
// =============================================================================

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function colorize(text: string, color: keyof typeof COLORS): string {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function formatStatus(passed: boolean): string {
  return passed ? colorize('✅', 'green') : colorize('❌', 'red');
}

function printHeader() {
  console.log('\n' + colorize('═'.repeat(80), 'cyan'));
  console.log(colorize('  SAFRUN SDK Verification Report', 'bold'));
  console.log(colorize('═'.repeat(80), 'cyan') + '\n');
}

function printTableHeader() {
  const header = [
    'File Path'.padEnd(50),
    'SDK'.padEnd(6),
    'Types'.padEnd(7),
    'Format'.padEnd(8),
  ].join(' │ ');
  
  console.log(colorize('─'.repeat(80), 'dim'));
  console.log(colorize(header, 'bold'));
  console.log(colorize('─'.repeat(80), 'dim'));
}

function printFileResult(result: FileCheckResult) {
  const shortPath = result.filePath.length > 48 
    ? '...' + result.filePath.slice(-45)
    : result.filePath;
  
  const row = [
    shortPath.padEnd(50),
    formatStatus(result.sdkUsage.passed).padEnd(6),
    formatStatus(result.types.passed).padEnd(7),
    formatStatus(result.formatters.passed).padEnd(8),
  ].join(' │ ');
  
  console.log(row);
  
  // Print issues if any
  if (result.issues.length > 0) {
    for (const issue of result.issues) {
      console.log(colorize(`    ↳ ${issue}`, 'yellow'));
    }
  }
}

function printSummary(summary: Summary) {
  console.log('\n' + colorize('═'.repeat(80), 'cyan'));
  console.log(colorize('  Summary', 'bold'));
  console.log(colorize('═'.repeat(80), 'cyan'));
  
  console.log(`\n  Total files scanned:    ${colorize(String(summary.totalFiles), 'bold')}`);
  console.log(`  Passing all checks:     ${colorize(String(summary.passedAll), 'green')}`);
  console.log(`  Needs attention:        ${colorize(String(summary.needsAttention), summary.needsAttention > 0 ? 'red' : 'green')}`);
  
  if (summary.needsAttention > 0) {
    console.log(`\n${colorize('⚠️  Some files need attention. See details above.', 'yellow')}`);
  } else {
    console.log(`\n${colorize('✅ All checks passed!', 'green')}`);
  }
  
  console.log('\n');
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  printHeader();
  
  // Initialize ts-morph project
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      allowJs: true,
      jsx: 2, // React
    },
  });

  const allFiles: string[] = [];

  // Collect files from scan directories
  console.log(colorize('Scanning directories...', 'dim'));
  for (const dir of SCAN_DIRECTORIES) {
    const files = getTypeScriptFiles(dir);
    console.log(`  ${dir}: ${files.length} files`);
    allFiles.push(...files);
  }

  // Add utility files
  for (const utilFile of UTILITY_FILES) {
    const fullPath = path.join(ROOT_DIR, utilFile);
    if (fs.existsSync(fullPath)) {
      allFiles.push(fullPath);
      console.log(`  ${utilFile}: 1 file`);
    }
  }

  console.log(`\nTotal: ${allFiles.length} files to analyze\n`);

  // Analyze all files
  const results: FileCheckResult[] = [];
  
  printTableHeader();
  
  for (const filePath of allFiles) {
    try {
      const result = analyzeFile(filePath, project);
      results.push(result);
      printFileResult(result);
    } catch (error) {
      console.error(colorize(`Error analyzing ${filePath}: ${error}`, 'red'));
    }
  }

  // Calculate summary
  const passedAll = results.filter(
    r => r.sdkUsage.passed && r.types.passed && r.formatters.passed
  ).length;
  
  const summary: Summary = {
    totalFiles: results.length,
    passedAll,
    needsAttention: results.length - passedAll,
    results,
  };

  printSummary(summary);

  // Exit with appropriate code
  process.exit(summary.needsAttention > 0 ? 1 : 0);
}

// Run
main().catch((error) => {
  console.error(colorize(`Fatal error: ${error}`, 'red'));
  process.exit(1);
});

