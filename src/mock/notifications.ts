export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Staking Rewards Received',
    message: 'You received 45.2 LPT in staking rewards from streamplace.eth',
    type: 'success',
    timestamp: '2024-01-15T10:30:00Z',
    read: false
  },
  {
    id: '2',
    title: 'Validator Performance Update',
    message: 'everest-node.eth has increased its APY to 72.1%',
    type: 'info',
    timestamp: '2024-01-14T15:45:00Z',
    read: true
  },
  {
    id: '3',
    title: 'Withdrawal Completed',
    message: 'Your withdrawal of 1,200 USDC has been processed successfully',
    type: 'success',
    timestamp: '2024-01-13T09:20:00Z',
    read: true
  },
  {
    id: '4',
    title: 'New Validator Available',
    message: 'ultimaratio.eth is now available for staking with 64.9% APY',
    type: 'info',
    timestamp: '2024-01-12T14:15:00Z',
    read: false
  },
  {
    id: '5',
    title: 'Maintenance Notice',
    message: 'Scheduled maintenance will occur on January 20th from 2-4 AM UTC',
    type: 'warning',
    timestamp: '2024-01-11T11:30:00Z',
    read: true
  }
];
