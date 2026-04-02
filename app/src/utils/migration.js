// app/src/utils/migration.js

const OLD_GAME_KEY = 'seventh-cipher-game-state'
const NEW_GAME_KEY = 'ducheng_shanghai_state'
const MIGRATION_FLAG = 'ducheng_migration_done'

/**
 * One-time migration from old single-city format to new multi-city format.
 * Safe to call multiple times — skips if already migrated.
 */
export function migrateFromV1() {
  // Skip if already migrated
  if (localStorage.getItem(MIGRATION_FLAG)) return

  // Migrate game state
  const oldState = localStorage.getItem(OLD_GAME_KEY)
  if (oldState && !localStorage.getItem(NEW_GAME_KEY)) {
    localStorage.setItem(NEW_GAME_KEY, oldState)
    console.log('[migration] Migrated game state: seventh-cipher → ducheng_shanghai')
  }

  // Mark as done
  localStorage.setItem(MIGRATION_FLAG, Date.now().toString())
  console.log('[migration] V1→V2 migration complete')
}
