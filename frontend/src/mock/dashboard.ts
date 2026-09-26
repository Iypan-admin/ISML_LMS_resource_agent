export const mockDashboardStats = {
  totalResources: 486,
  activeResources: 472,
  languagesCount: 8,
  categoriesCount: 10,
  needsReviewCount: 14,
  aiActivity: {
    resourcesDiscovered: 142,
    duplicatesDetected: 12,
    brokenLinks: 3,
    copyrightReviewNeeded: 5,
    classifiedThisWeek: 68
  }
};

export const mockRecentAIActivity = [
  { id: 'act-feed-1', title: '12 German A1 resources discovered', timestamp: '10 minutes ago', type: 'discovery', color: 'bg-emerald-500' },
  { id: 'act-feed-2', title: '3 duplicate resources detected & flagged', timestamp: '1 hour ago', type: 'duplicate', color: 'bg-amber-500' },
  { id: 'act-feed-3', title: '2 resources require copyright risk review', timestamp: '3 hours ago', type: 'copyright', color: 'bg-rose-500' },
  { id: 'act-feed-4', title: '15 Spanish resources automatically classified', timestamp: 'Yesterday', type: 'classification', color: 'bg-blue-500' },
  { id: 'act-feed-5', title: 'Periodic broken link check completed (3 flagged)', timestamp: 'Yesterday', type: 'health', color: 'bg-purple-500' }
];
