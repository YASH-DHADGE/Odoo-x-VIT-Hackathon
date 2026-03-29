export const QUEUE_NAMES = {
  OCR_PROCESSING: 'ocr-processing',
  NOTIFICATIONS: 'notifications',
  EMAIL: 'email',
} as const;

export const JOB_NAMES = {
  SCAN_RECEIPT: 'scan-receipt',
  PARSE_RESULT: 'parse-result',
  APPROVAL_ACTION: 'approval-action',
  PENDING_APPROVAL: 'pending-approval',
  SEND_PASSWORD: 'send-password',
  RESET_PASSWORD: 'reset-password',
} as const;
