/**
 * Utility Type Definitions
 * Types for scheduled emails and email processing
 */

export interface EmailQueueStats {
	pending: number
	sent: number
	failed: number
	total: number
}

export interface EmailProcessResult {
	success: boolean
	processed: number
	errors: number
}
