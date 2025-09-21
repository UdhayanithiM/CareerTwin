// lib/apiClient.ts
import { auth } from './firebase';

export const apiClient = {
  // ✨ NEW: A method for sending JSON data
  post: async (url: string, body: any) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated. Please log in.");
    }
    const token = await user.getIdToken(true); // Force refresh

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        // Set the correct content type for JSON
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'The API request failed.');
    }
    return data;
  },
  
  // The existing method for FormData remains unchanged
  postFormData: async (url: string, formData: FormData) => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated. Please log in.");
    }
    const token = await user.getIdToken(true); // Force refresh

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'The API request failed.');
    }
    return data;
  }
};