import { v4 as uuidv4 } from 'uuid';

const BROWSER_ID_KEY = 'planning_poker_browser_id';

export const getBrowserId = async (): Promise<string> => {
  // First try to get from localStorage
  const storedId = localStorage.getItem(BROWSER_ID_KEY);
  if (storedId) {
    return storedId;
  }

  // Generate new ID
  const newId = uuidv4();
  
  try {
    // Try to store in localStorage
    localStorage.setItem(BROWSER_ID_KEY, newId);
    return newId;
  } catch (error) {
    console.error('Error storing browser ID:', error);
    // If localStorage fails, just return the generated ID
    return newId;
  }
}; 