export interface Asset {
  id: number;
  name: string;
  symbol: string;
  balance: string;
  amount: string;
  price: string;
  change: string;
  icon: string;
  bgColor: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number | string;
  asset?: string;
  status: TransactionStatus;
  timestamp: string;
}

export type TransactionStatus = "Pending" | "Failed" | "Successful";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  resultsPerPage: number;
  onPageChange: (page: number) => void;
  onResultsPerPageChange: (results: number) => void;
}

export interface AuditTrail {
  initiatedBy: string;
  initiatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface BlockchainInfo {
  network: string;
  blockNumber?: number;
  confirmations: number;
  gasFee?: string;
  explorerUrl?: string;
  hash?: string;
}

export interface TransactionDetails extends Transaction {
  auditTrail: AuditTrail;
  blockchainInfo?: BlockchainInfo;
}
