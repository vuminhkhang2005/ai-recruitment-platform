import { useEffect } from 'react';

/** Sets document.title as "<title> | TalentBridge". */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | TalentBridge` : 'TalentBridge - Việc làm IT';
  }, [title]);
}
