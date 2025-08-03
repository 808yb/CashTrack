# Changelog

All notable changes to the Cashtrack project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Migrated from localStorage to IndexedDB for improved storage capabilities
  - Tips history now uses IndexedDB for unlimited storage
  - Tag system moved to IndexedDB
  - Notifications system upgraded to use IndexedDB
  - Added proper async/await handling in all components
  - Added automatic data migration from localStorage to IndexedDB
  - Added migration status tracking to prevent duplicate migrations
  - Added visual progress indicator for data migration
  - Added automatic rollback mechanism for failed migrations
  - Added data backup before migration starts
  - Moved migration initialization to client components only
  - Added date-based indexing for faster tip queries
  - Added bulk operations for tip management
  - Added comprehensive error handling

### Added
- Initial project setup with Next.js 14.2.5
- UI components using shadcn/ui library
- PWA support with service worker
- Main dashboard page with transaction tracking
- Calendar view for transaction history
- Add tips functionality
- Profile management page
- Custom coin icons and button components
- Notification system with NotificationBell component
- Page transitions and animations
- Tag management system
- Theme provider for consistent styling
- Mobile responsiveness using custom hooks

### Components
- Added various UI components including:
  - NotificationBell
  - PageTransition
  - TagManager
  - TagSelector
  - Multiple coin icons (Coin1, Coin2, Coin5, CustomCoins)
  - Full suite of shadcn/ui components

### Technical
- Next.js 14.2.5 with App Router
- TypeScript support
- Tailwind CSS for styling
- PWA configuration
- Service worker implementation
- Context API for notifications
- Custom hooks for mobile detection and animations
- IndexedDB implementation for:
  - Tips history and management
  - Tag system
  - Notifications persistence
  - Data migration utilities with progress tracking
  - Automatic rollback system
  - Indexed queries for performance
  - Bulk operations support
  - Comprehensive error handling

### Fixed
- Fixed a bug in TagManager where adding a new tag would cause default tags to disappear. TagManager now correctly preserves default tags when adding, editing, or deleting tags.
- Default tags are now only re-inserted if the tag store is completely empty, allowing users to delete default tags and have them stay deleted unless all tags are removed.
- Fixed tip persistence issues by bumping IndexedDB version to 2 and adding missing `tags` field to TipEntry type
- Fixed async state update in handleEditTag function to properly await tag updates

Note: This changelog was created to start tracking changes. Previous changes have been aggregated into the initial entry. 